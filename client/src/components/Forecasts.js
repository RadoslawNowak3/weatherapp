import ForecastCard from "./ForecastCard";
const Forecasts = (props) => {
    let forecastList=[]
    let cityName="";
    let cityLat="";
    let cityLon=""
    if (props.data && props.data.length>0) {
        cityName=props.data[0].cityName;
        cityLon=props.data[0].cityLat;
        cityLat=props.data[0].cityLon;
        props.data.map((item, idx) => {
            if((idx%4)===0)
                forecastList.push(<div className="col-md-4"></div>)
            forecastList.push(<ForecastCard data={item}/>)
        })
    }
    return(<div className="grid">
            <h1>{cityName}</h1>
            <h5>Latitude:{cityLat}</h5>
            <h5>Longtitude:{cityLon}</h5>
            {forecastList}
        </div>
       )
}
export default Forecasts;