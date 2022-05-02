import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {WiDaySunny, WiDayRain, WiDaySnow, WiWindy, WiCelsius, WiBarometer, WiDayCloudy} from "weather-icons-react";
const ForecastCard = (props) =>{
    let icon = null;
    let humanDateFormat;
    let day;
    if(props.data!==undefined) {
        let dateObject = new Date(props.data.forecastDate*1000)
         humanDateFormat = dateObject.toString().substring(4,15)
         day = dateObject.toString().substring(0,3)
        if (props.data.description.toString().includes("rain"))
            icon = <WiDayRain size={24} color='#000'/>
        else if (props.data.description.toString().includes("snow"))
            icon = <WiDaySnow size={24} color='#000'/>
        else if (props.data.description.toString().includes("cloud"))
            icon = <WiDayCloudy size={24} color='#000'/>
            else
            icon = <WiDaySunny size={24} color='#000'/>
    }
    return(props.data!==undefined &&
        <Card sx={{ width:"18rem",display:"inline-flex",margin:"auto",textAlign:"center", align:"center",justifyContent:"center"}}>
                <CardContent>
                    <Typography gutterBottom variant="h5" textAlign="center" component="div">
                          {humanDateFormat}
                    </Typography>
                    <Typography gutterBottom variant = "h6" textAlign="center" component ="div">
                        {day}
                    </Typography>
                    <Typography gutterBottom variant="h7" color="text.secondary" component="div">
                        {icon}  {props.data.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component ="div">
                        <WiCelsius size={24} color='#000'/> Temperature: {((props.data.degrees-273)).toFixed(1)} C
                    </Typography>
                    <Typography gutterBottom variant="body2"  color="text.secondary" component="div">
                        <WiBarometer size={24} color='#000'/> Pressure: {props.data.pressure} Pa
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <WiWindy size={24} color='#000'/> Wind: {props.data.windspeed} km/h
                    </Typography>
                </CardContent>
        </Card>
    )
}
export default ForecastCard;