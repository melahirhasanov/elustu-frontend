import React, { useState } from 'react';
import { TextField, InputAdornment, Button, CardMedia, Card, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Grid, Typography, Box } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import PowerDrillIcon from "@mui/icons-material/Power";
import style from "./Home.module.css"
const categories = [
    {
      id: "Meclis",
      label: "Meclis",
      icon: <BuildIcon fontSize='large' />, 
      subcategories: [
        "Ümumi Mebel Montajı",
        "IKEA Montajı",
        "Beşik Montajı",
        "PAX Montajı",
        "Kitab Rəfinin Montajı",
        "Stolun Yığılması"
      ],
      Image: "https://i.pinimg.com/736x/21/fe/c4/21fec4c319912f8aae2b841c8b7720e5.jpg",
      Image2: "https://i.pinimg.com/736x/1f/2b/49/1f2b4911e08ac327e8cc0acfc2290157.jpg",
      title: "Mebel Montajı",
      description: "Mebelinizin düzgün və etibarlı şəkildə yığılması üçün peşəkar xidmət."
    },
    {
      id: "Montaj",
      label: "Montaj",
      icon: <PowerDrillIcon fontSize='large' />, 
      subcategories: [
        "Asmaq İncəsənəti",
        "Jalüz və Pəncərə baxımlarının quraşdırılması",
        "Montaj və Anker Mebel",
        "Rəflərin və Çubuqların və Qarmaqların Montajı",
        "Digər Montaj İşləri",
        "Televizor Yığılması"
      ],
      Image: "https://i.pinimg.com/736x/b9/8a/08/b98a08faf868ff1b1b519ed48be0c1a3.jpg",
      Image2: "https://i.pinimg.com/474x/96/b0/c3/96b0c39dbba1c341bc0ea6e2e9048c0f.jpg",
      title: "Montaj Xidmətləri",
      description: "Televizorunuzu, rəflərinizi, rəsmlərinizi, güzgülərinizi və daha çoxunu etibarlı şəkildə quraşdırın."
    },
    {
      id: "Dasima",
      label: "Dasima",
      icon: <DirectionsCarIcon fontSize='large' />, 
      subcategories: [
        "Daşıma Üçün Kömək",
        "Yük Maşının köməyi ilə hərəkət",
        "Zibil və Mebelin Təmizlənməsi",
        "Ağır Qaldırma və Yükləmə",
        "Mebelin Yenidən Qurulması",
        "Zərbsiz Daşıma"
      ],
      Image: "https://i.pinimg.com/736x/f7/51/ca/f751cae95dde6a9405d13bbcbef413f1.jpg",
      Image2: "https://i.pinimg.com/736x/a0/2f/50/a02f507b27d41dd50459111694da99e7.jpg",
      title: "Ev və Ofis Daşıma Xidmətləri",
      description: "Hər növ mebel və yükünüzü təhlükəsiz və rahat şəkildə daşıyırıq."
    },
    {
      id: "Temizleme",
      label: "Temizleme",
      icon: <CleaningServicesIcon fontSize='large' />, 
      subcategories: [
        "Təmizləmə",
        "Ümumi Partiya Təmizləmə",
        "Mənzilin Təmizliyi",
        "Dərin Təmizlik",
        "Qaraj Təmizliyi",
        "Təmiz Çıxın"
      ],
      Image: "https://i.pinimg.com/474x/c5/07/1b/c5071b4a131e02bf5e1434d8fa72d8b0.jpg",
      Image2: "https://i.pinimg.com/474x/bc/50/29/bc5029813d33137a8e9651a6865012b2.jpg",

      title: "Ev və Ofis Təmizliyi",
      description: "Peşəkar və detallı təmizlik xidməti ilə evinizi və ofisinizi tərtəmiz saxlayın."
    },
    {
      id: "Xarici_Yardim",
      label: "Xarici Yardim",
      icon: <OutdoorGrillIcon fontSize='large' />, 
      subcategories: [
        "Həyət İşi",
        "Çəmənliyə Xidmət",
        "Qar Təmizləmə",
        "Ətrafın Abadlaşdırılması",
        "Budaq və Çit Budama",
        "Bağçılıq və Alaq Otları"
      ],
      Image: "https://i.pinimg.com/736x/3c/59/a3/3c59a3fece7bf788a823fedf46cd8648.jpg",
      Image2: "https://i.pinimg.com/474x/bc/7f/02/bc7f022cf4e3482f7c0c22e872f97e50.jpg",

      title: "Bağ və Həyət Xidmətləri",
      description: "Həyətyanı sahənizi abadlaşdırmaq və gözəlləşdirmək üçün peşəkar kömək."
    },
    {
      id: "Ev_Temiri",
      label: "Ev Temiri",
      icon: <HomeRepairServiceIcon fontSize='large' />, 
      subcategories: [
        "Divar Kağızlarının Yapışdırılması",
        "Laminat və Parket Döşənməsi",
        "Santexnika və Su Xətləri Təmiri",
        "Elektrik Xətləri və Lüstur Quraşdırılması",
        "Qapı, Şkaf və Mebel Təmiri",
        "Boya və Suvaq İşləri"
      ],
      Image: "https://i.pinimg.com/474x/12/b5/29/12b529a40fceb2a14d8e1d3bc513c8b5.jpg",
      Image2: "https://i.pinimg.com/736x/31/b2/34/31b234507b4ec5a240e43d0d74765f0d.jpg",

      title: "Ev Təmiri Xidmətləri",
      description: "Evinizin istənilən sahəsini yeniləmək və təmir etmək üçün mütəxəssis dəstəyi."
    },
    {
      id: "Resm",
      label: "Resm",
      icon: <FormatPaintIcon fontSize='large' />, 
      subcategories: [
        "Dizayn və Rəng Seçimi Məsləhətləri",
        "Divar Rəsmləri və Dekorasiya",
        "Portret və Abstrakt Rəsmlər",
        "Mətbəx və Qonaq Otağı Dizaynı",
        "Tavan və Divar Naxışları",
        "Minimalist və Klassik Dizayn İşləri"
      ],
      Image: "https://i.pinimg.com/474x/94/6d/03/946d0303e6e39f0f02f9d8e65dc1d0e5.jpg",
      Image2: "https://i.pinimg.com/474x/74/7b/b7/747bb75c866e8098ddbe55150aaac16a.jpg",
      title: "İncəsənət və Dekorasiya",
      description: "Dizayn və dekorasiya xidmətləri ilə məkanınıza yeni görünüş bəxş edin."
    },
    {
      id: "Trend",
      label: "Trend",
      icon: <WhatshotIcon fontSize='large' />, 
      subcategories: [
        "3D Divar Panellərinin Quraşdırılması",
        "Ağıllı Ev Sistemlərinin Montajı",
        "Sürüşkən Qapı və Şkaf Sistemləri",
        "Modul Mətbəx və Dəhliz Dizaynı",
        "LED İşıqlandırma və Dekorativ İşıqlandırma",
        "Ev və Ofis Daxili Yaşıl Bitkilərlə Dekorasiya"
      ],
      Image: "https://i.pinimg.com/474x/95/bb/22/95bb2277e5a2e35bc3f4ae14d00b2643.jpg",
      Image2: "https://i.pinimg.com/474x/14/39/a4/1439a4b858ae1c88cfbdc959982e37c6.jpg",
      title: "Müasir Dekorasiya və Trendlər",
      description: "Evinizə və ofisinizə ən son dekorasiya trendləri ilə yenilik qatın."
    }
  ];
  





const Home = () => {
const [selected,setSelected]=useState("Meclis")  
  return (
    <>
      <div style={{ marginTop: "150px" }}>
        <h1 style={{ textAlign: "center", color: "darkGreen", fontSize: "300%" }}>
          Ev tapşırıqları üçün<br />
          Etibarlı yardım sifariş edin
        </h1>
        
        <div style={{ maxWidth: '500px', margin: '0 auto', paddingTop: '20px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <Button style={{ backgroundColor: "green", margin: "2px" }}>
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                </Button>
              ),
            }}
            sx={{
              borderRadius: '25px',
              border: "none",
              outline: "none",
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      </div>

      <Grid container spacing={3} justifyContent="center" sx={{ marginTop: "50px" }}>
        {categories.map((cat)=>(
<Grid item xs={3} md={1.5} sm={3} textAlign="center" justifyContent="center" key={cat.id}>
<Box display="flex" flexDirection="column" alignItems="center" 
sx={
    {
        cursor:"pointer",
        backgroundColor:selected===cat.id? "#e0f7fa": "#fff",
        borderRadius:"10px",
        padding:"10px",
        boxShadow:selected===cat.id?"0px 4px 10px rgba(0, 0, 0, 0.2)" : "none",
        transition:"all 0.3 ease",
        "&:hover":{color: "#0077b6", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }

    }
}
onClick={()=>setSelected(selected===cat.id?"none":cat.id)}>
    {cat.icon}
    <Typography variant='body2' sx={{marginTop:1,fontWeight:"bold"}}>
        {cat.label}
    </Typography>
</Box>
</Grid>

        ))}
      </Grid>
      <hr />
{selected && (
    <Grid container spacing={0} justifyContent="center" sx={{marginTop:"50px"}}>
        <Grid item xs={12}>
            <Typography variant='h6' align='center' sx={{fontWeight:"bold",marginBottom:"20px"}}>
                {categories.find((cat)=>cat.id===selected).label}-Alt Kateqoriyalar
            </Typography>
        </Grid>
        {categories.find((cat)=>cat.id===selected).subcategories.map((sub,index)=>(
            <Grid item key={index} xs={5.3} sm={3} md={1.5} textAlign="center" margin="10px" width={"110px"}>
                <Button variant='outlined' sx={{width:"100%",padding:"10px",fontSize:"14px",height:"150px"}}>
                    {sub}
                </Button>
        <hr />
        
    </Grid>))}

    
</Grid>

      )}
              <hr />
              <Grid container spacing={3} sx={{ p: 4 }}>
  <Grid item xs={12} sx={{ position: "relative", margin: "auto" }}>
    <Typography className={style.Name} variant="h6" align="center" sx={{ position: "absolute", fontWeight: "bold", marginBottom: "20px" }}>
      <img 
        src={categories.find((cat) => cat.id === selected)?.Image} 
        alt="" 
        style={{
          width: "100%",
          maxWidth: "1300px",
          height: "700px",  // Şəkil proporsional olaraq dəyişəcək
          objectFit: "cover",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          margin: "auto",
          minWidth: "70%",
          display: "block",
          justifyContent:"center"
        }}  
      />
    </Typography>
    <Typography 
      variant="h6" 
      align="center" 
      sx={{
        fontWeight: "bold",
        marginTop: "230px",
        marginRight: "60px",
        marginBottom: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        position: "absolute",
        color: "rgba(255,255,255,0.85)",
        
      }}
    >
      {categories.find((cat) => cat.id === selected)?.title}
      <br />
      {categories.find((cat) => cat.id === selected)?.description}
    </Typography>
  </Grid>
</Grid>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/><br/>
<br/><br/>
<br/><br/><br/><br/>
<br/><br/>
<br/><br/>
<br/>

<br/>
<br/>
<br/>
<br/>
<br/>
<br/><br/>
<br/><br/>
<br/><br/>
<hr/>
<br/>
<br/>
<Grid className={style.Grid}  container spacing={3} sx={{ p: 4 }}>
  <Grid item xs={12} sx={{ position: "relative", margin: "auto" }}>
    <Typography className={style.Name} variant="h6" align="center" sx={{ position: "absolute", fontWeight: "bold", marginBottom: "20px" }}>
      <img 
        src="https://i.pinimg.com/736x/96/a9/91/96a99167c37d25adf6ef2c3730c40c8f.jpg"
        alt="" 
        style={{
          width: "100%",
          maxWidth: "1300px",
          height: "700px",  // Şəkil proporsional olaraq dəyişəcək
          objectFit: "cover",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          margin: "auto",
          minWidth: "70%",
          display: "block",
          justifyContent:"center"
        }}  
      />
    </Typography>
    <Typography 
      variant="h6" 
      align="center" 
      sx={{
        fontWeight: "bold",
        marginTop: "230px",
        marginRight: "60px",
        marginBottom: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        position: "absolute",
        color: "rgba(36, 4, 4, 0.85)",
        
      }}
    >
      <h3>Ustani Nece Sifaris ede bilersiniz?</h3>

      
      <h5 style={{fontSize:"17px"}}>
1
Qiymətə, bacarıqlara və rəylərə görə Tasker seçin.
<br/>
2
Bu günə qədər bir Tasker planlaşdırın.
<br/>

3
Söhbət edin, ödəniş edin, məsləhət verin və hamısını bir yerdə nəzərdən keçirin.</h5>
    </Typography>
  </Grid>
</Grid>
<br/>
<br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/><br/>
<br/><br/>
<br/><br/><br/><br/>
<br/><br/>
<br/><br/>
<br/>

<br/>
<br/>
<br/>
<br/>
<br/>
<br/><br/>
<br/><br/>
<br/><br/>
<hr/>
<br/>
<br/>
<Grid container spacing={0} justifyContent="center" sx={{marginTop:"50px"}} maxWidth={"1200px"}>
        <Grid item xs={12}>
            <Typography variant='h6' align='center' sx={{fontWeight:"bold",marginBottom:"20px"}}>
                Populyar Projektlerimiz
            </Typography>
        </Grid>

{categories.map((sub,index)=>(
            <Grid item key={index} xs={4.7} sm={3} md={2.5} textAlign="center" margin="10px" width={"110px"}>
                <Card sx={{height:"200px"}}>
                <CardMedia>
                <img src={sub.Image} alt="" height={"120px"} width={"100%"} />

                </CardMedia>
                <CardContent> {sub.subcategories[0]}</CardContent></Card>
                <br/>
                <br/>
                    <Card sx={{height:"200px"}}>
                <CardMedia>
                <img src={sub.Image2} alt="" height={"120px"} width={"100%"} />

                </CardMedia>
                <CardContent> {sub.subcategories[1]}</CardContent></Card>
                
        <hr />
        
    </Grid>))}

    
</Grid>
<Grid container spacing={0} justifyContent="center" sx={{marginTop:"50px"}}>
        <Grid item xs={12}>
            <Typography variant='h6' align='center' sx={{fontWeight:"bold",marginBottom:"20px"}}>
                Elə Bu dəqiqə Kömək Al
            </Typography>
        </Grid>
        {categories.map((sub,index)=>(
            <Grid item key={index} xs={5.3} sm={3} md={2.5} textAlign="center" margin="10px" width={"110px"}>
                <Button color='black' variant='outlined' sx={{width:"100%",padding:"10px",fontSize:"14px",height:"150px"}}>
                    {sub.subcategories[0]}
                </Button>
                <br/><br/>
                <Button color='black' variant='outlined' sx={{width:"100%",padding:"10px",fontSize:"14px",height:"150px"}}>
                    {sub.subcategories[1]}
                </Button>
        <hr />
        
    </Grid>))}

    
</Grid>
<Grid container spacing={0} justifyContent="center" sx={{marginTop:"50px"}} maxWidth={"1200px"}>
        <Grid item xs={12}>
            <Typography variant='h6' align='center' sx={{fontWeight:"bold",marginBottom:"20px",marginRight:"630px"}}>
            Məmnuniyyətinizə  zəmanət verilir:
            </Typography>
        </Grid>


            <Grid item  xs={28} sm={26} md={12} textAlign="center" margin="0px"  width={"1100px"} display={"flex"} justifyContent={"center"} alignItems={"center"} marginLeft={"470px"}>
                <Card className={style.card} sx={{height:"290px",margin:"5px"}}>
                <CardMedia>
                <img src="https://i.pinimg.com/736x/6a/43/ed/6a43edadf2085d41c11047a177795858.jpg" alt="" height={"190px"} width={"100%"} />

                </CardMedia>
                <CardContent> Xoşbəxtlik əhdi<br/>
                Əgər razı deyilsinizsə, onu düzəltmək üçün çalışacağıq.</CardContent></Card><br/><br/><br/>
                <Card className={style.card} sx={{height:"290px",margin:"5px"}}>
                <CardMedia>
                <img src={"https://i.pinimg.com/736x/11/87/fd/1187fd5eb70abcb613fab5e3e6c3c01b.jpg"} alt="" height={"190px"} width={"100%"} />

                </CardMedia>
                <CardContent>Təcrübəli Tapşırıqlar<br/>
                Tapşırıqçılar platformaya qoşulmazdan əvvəl həmişə fon yoxlanılır. </CardContent></Card><br/><br/><br/>
                <Card className={style.card} sx={{height:"290px",margin:"5px"}}>
                <CardMedia>
                <img src="https://i.pinimg.com/474x/7d/7c/15/7d7c15fc856746035e398ee6f932d456.jpg" alt="" height={"190px"} width={"100%"} />

                </CardMedia>
                <CardContent>Xüsusi Dəstək<br/>
                Bizə ehtiyac duyduğunuz zaman gülərüz xidmət – həftənin hər günü. </CardContent></Card>
                
        <hr />
        
    </Grid>

    
</Grid>

    </>
  )
};

export default Home;
