import './App.css';
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import {Navbar} from "react-bootstrap";
import {useState,useEffect} from "react";
import { Autocomplete,TextField } from '@mui/material';
import Forecasts from "./components/Forecasts";
import axios from "axios";
function App() {
    const [baseData,setBaseData] = useState()
    const [value,setValue] = useState(null)
    const [loading, setLoading] = useState(false);
    const [choices, setChoices] = useState([])
    const [error,setError] = useState(false)
    const getLocation = () =>{
        try {
            if(value)
            axios.get("http://localhost:3001/city", {params: {cityname: value}}).then(response => {
                setBaseData(response.data)
                setError(false)
            }).catch(function (error) {
                console.log(error)
                setError(true)
            })
        } catch(error) {
            console.log("Error fetching weather data")
        }
    }
    useEffect(() => {
            setLoading(true)
            try {
                axios.get("http://localhost:3001/cities").then(response => {
                    let cities = [];
                    for (let result in response.data) {
                        cities.push(response.data[result].cityName)
                    }
                    setChoices(cities)
                    setLoading(false)
                })
            } catch(error){
                console.log("Error populating search list")
            }
        },[])
    useEffect(()=>{
        setLoading(true)
        getLocation();
        setLoading(false)
    },[value])
    return (
        <div>
            {loading ? <div>Loading...</div> :
                <div className="App">
                    <Navbar variant="dark" bg="dark">
                        <Navbar.Brand>Test weather app</Navbar.Brand>
                        <Navbar.Collapse className="justify-content-end">
                            <LoginButton/>
                            <LogoutButton/>
                        </Navbar.Collapse>
                    </Navbar>
                    <h1>Which city's weather forecast would you like to see?</h1>
                    <div className="searchbar">
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={choices}
                            sx={{width: 300}}
                            value={value}
                            onChange={(event,newValue)=> setValue(newValue)
                            }
                            renderInput={(params) => <TextField {...params} label="Search"/>}
                        />
                    </div>
                    {(value!==null)? (error===false)? <Forecasts data = {baseData}/>: <p> Error loading data...</p> : <p>Choose a location...</p>}
                </div>
            }
        </div>
    );
}
export default App;