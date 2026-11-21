import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { errorMessage } from "../api/client";

const STORAGE_KEY = "usta_auth";

// JWT-nin vaxtı bitibsə, saxlanmış sessiya istifadə olunmur
function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.token && saved?.user && isTokenValid(saved.token)) return saved;
  } catch {
    /* boş və ya pozulmuş yaddaş */
  }
  return null;
}

function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* gizli rejimdə localStorage əlçatmaz ola bilər */
  }
}

const saved = loadSession();

const initialState = {
  user: saved?.user || null,
  token: saved?.token || null,
  role: saved?.role || null, // "customer" | "master" | "admin"
  loading: false,
  error: null,
};

// Müştəri və usta üçün eyni giriş məntiqi, fərqli endpoint
const makeLogin = (type, endpoint, role) =>
  createAsyncThunk(type, async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(endpoint, { email, password });
      return { user: data.user, token: data.token, role };
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Giriş alınmadı"));
    }
  });

export const login = makeLogin("auth/login", "/api/auth/login", "customer");
export const loginUsta = makeLogin("auth/loginUsta", "/api/auth/loginUsta", "master");
export const loginAdmin = makeLogin("auth/loginAdmin", "/api/admin/login", "admin");

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    await api.post("/api/auth/register", userData);
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Qeydiyyat alınmadı"));
  }
});

export const registerUsta = createAsyncThunk("auth/registerUsta", async (userData, { rejectWithValue }) => {
  try {
    await api.post("/api/auth/registerUsta", userData);
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Qeydiyyat alınmadı"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.error = null;
      saveSession(null);
    },
    // Profil redaktəsindən sonra yerli istifadəçi məlumatını yeniləyir
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      saveSession({ user: state.user, token: state.token, role: state.role });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || "Xəta baş verdi";
    };
    const loggedIn = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      saveSession(action.payload);
    };
    const registered = (state) => {
      state.loading = false;
    };

    for (const thunk of [login, loginUsta, loginAdmin]) {
      builder.addCase(thunk.pending, pending).addCase(thunk.fulfilled, loggedIn).addCase(thunk.rejected, rejected);
    }
    for (const thunk of [register, registerUsta]) {
      builder.addCase(thunk.pending, pending).addCase(thunk.fulfilled, registered).addCase(thunk.rejected, rejected);
    }
  },
});

export const { logout, updateUser, clearError } = authSlice.actions;

// Chat-də istifadə olunan ID: usta üçün Mongo ID, müştəri üçün email (mövcud mesajlarla uyğunluq)
export const selectChatId = (state) =>
  state.auth.role === "master" ? state.auth.user?.id : state.auth.user?.email;

export const selectDisplayName = (state) => {
  const u = state.auth.user;
  if (!u) return "";
  return [u.name, u.surname].filter(Boolean).join(" ") || u.username || u.email;
};

export default authSlice.reducer;
