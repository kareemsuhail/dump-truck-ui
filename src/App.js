import React, {Component} from 'react';
import {Scatter} from 'react-chartjs-2'
import axios from 'axios'
import ReactChartkick, {LineChart, PieChart} from 'react-chartkick'


class App extends Component {


    constructor(props) {
        super(props);
        this.state = {
            young_gcs: {},
            mixed_gcs: {},
            predicted_base_time: {},
            predicted_pause_time: {},
            string_deduplication: {},
            number_of_gcs_exceeds_goal: 0,
            number_of_gcs_match_goal: 0,
            status: "pending"
        };
        this.formatResponse = this.formatResponse.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    formateDate(timeStamp) {
        let date = new Date(timeStamp);
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let milliseconds = date.getMilliseconds();
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`
    }

    formatResponse(response) {
        let young_gcs_tmp = {};
        let mixed_gcs_tmp = {};
        let predicted_base_time_tmp = {};
        let predicted_pause_time_tmp = {};
        let string_deduplication_tmp = {};
        let number_of_gcs_exceeds_goal_tmp = 0;
        let number_of_gcs_match_goal_tmp = 0;
        response.data.forEach(gcData => {
            switch (gcData.name) {
                case "YOUNG_GC":
                    young_gcs_tmp[new Date(gcData.timestamp)] = gcData.value * 1000;
                    if (gcData.value * 1000 > 50) {
                        number_of_gcs_exceeds_goal_tmp++;
                    } else {
                        number_of_gcs_match_goal_tmp++;
                    }
                    break;
                case "MIXED_GC":
                    mixed_gcs_tmp[new Date(gcData.timestamp)] = gcData.value * 1000;
                    if (gcData.value * 1000 > 50) {
                        number_of_gcs_exceeds_goal_tmp++;
                    } else {
                        number_of_gcs_match_goal_tmp++;
                    }
                    break;
                case "PREDICTED_BASE_TIME":
                    predicted_base_time_tmp[this.formateDate(gcData.timestamp)] = gcData.value;
                    break;
                case "PREDICTED_PAUSE_TIME":
                    predicted_pause_time_tmp[this.formateDate(gcData.timestamp)] = gcData.value;
                    break;
                case "STRING_DEDUPLICATION":
                    string_deduplication_tmp[this.formateDate(gcData.timestamp)] = gcData.value * 1000;
                    break;
            }
        });

        this.setState({
            young_gcs: young_gcs_tmp,
            mixed_gcs: mixed_gcs_tmp,
            predicted_base_time: predicted_base_time_tmp,
            predicted_pause_time: predicted_pause_time_tmp,
            string_deduplication: string_deduplication_tmp,
            number_of_gcs_exceeds_goal: number_of_gcs_exceeds_goal_tmp,
            number_of_gcs_match_goal: number_of_gcs_match_goal_tmp,
            status: "done"
        });
    }

    fetchData() {
        axios.get('http://localhost:8080/gc', {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        }).then((response) => {
            this.formatResponse(response);
        }).catch(err => console.log(err))
    }

    componentDidMount() {
        this.fetchData();
    }

    render() {
        if (this.state.status === "pending") {
            return <div>
                <h1>loading</h1>
            </div>
        } else {
            return (<div>
                <LineChart label="young_gc" data={this.state.young_gcs}/>
                <LineChart label="mixed_gcs" data={this.state.mixed_gcs}/>
                <LineChart label="predicted_base_time" data={this.state.predicted_base_time}/>
                <LineChart max={500} label="predicted_pause_time" data={this.state.predicted_pause_time}/>
                <LineChart label="string_deduplication" data={this.state.string_deduplication}/>
                <PieChart colors={["#b00", "#3bd320"]}
                          data={[["exceeds_our_goal", this.state.number_of_gcs_exceeds_goal], ["match_goal", this.state.number_of_gcs_match_goal]]}/>
            </div>)
        }
    }
}

export default App;
