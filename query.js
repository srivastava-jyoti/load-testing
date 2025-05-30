import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 30 },
    { duration: '1m', target: 0 },
  ],
};

const query = `
  query GetStateData($selectedState: String!) {
    statedata: states(pagination: { page: 1, pageSize: 1000 }) {
      data {
        id
        attributes {
          name
        }
      }
    }
    states: states(filters: { name: { eq: $selectedState } }, pagination: { page: 1, pageSize: 1000 }) {
      data {
        id
        attributes {
          name
          rti_forms {
            data {
              id
              attributes {
                RTI_Name
                RTI_memo_number
                scanned_file_location
                Scanned_files {
                  __typename
                  data {
                    id
                    attributes {
                      previewUrl
                      url
                    }
                  }
                }
                District_Name
                district {
                  data {
                    id
                    attributes {
                      name
                    }
                  }
                }
                blur_area_height
                margin_top
                Start_Date
                End_Date
                prison {
                  data {
                    id
                    attributes {
                      name
                    }
                  }
                }
                covid_19_vaccination_rti_prisoner {
                  data {
                    id
                    attributes {
                      Male1stDose_19_to_45
                      Female1stDose_19_to_45
                      Male1stDose_45_to_60
                      Female1stDose_45_to_60
                      Male1stDose_Age60_and_above
                      Female1stDose_Age60_and_above
                      MaleBothDoses_19_to_45
                      FemaleBothDoses_19_to_45
                      MaleBothDoses_45_to_60
                      FemaleBothDoses_45_to_60
                      MaleBothDoses_Age60_and_above
                      FemaleBothDoses_Age60_and_above
                      Male1stDose_19_to_45_Dropdown
                      Female1stDose_19_to_45_Dropdown
                      Male1stDose_45_to_60_Dropdown
                      Female1stDose_45_to_60_Dropdown
                      Male1stDose_Age60_and_above_dropdown
                      Female1stDose_Age60_and_above_dropdown
                      MaleBothDoses_19_to_45_Dropdown
                      FemaleBothDoses_19_to_45_Dropdown
                      MaleBothDoses_45_to_60_Dropdown
                      FemaleBothDoses_45_to_60_Dropdown
                      MaleBothDoses_Age60_and_above_Dropdown
                      FemaleBothDoses_Age60_and_above_Dropdown
                      total_prisoner_1stDose
                      total_prisoner_bothDose
                      total_prisoner_1stDose_Dropdown
                      total_prisoner_bothDose_Dropdown
                      vaccination_documents
                    }
                  }
                }
                covid_19_vaccination_rti_prison_staffs {
                  data {
                    id
                    attributes {
                      Male1stDose_19_to_45
                      Female1stDose_19_to_45
                      Male1stDose_45_to_60
                      Female1stDose_45_to_60
                      Male1stDose_Age60_and_above
                      Female1stDose_Age60_and_above
                      MaleBothDoses_19_to_45
                      FemaleBothDoses_19_to_45
                      MaleBothDoses_45_to_60
                      FemaleBothDoses_45_to_60
                      MaleBothDoses_Age60_and_above
                      FemaleBothDoses_Age60_and_above
                      Male1stDose_19_to_45_Dropdown
                      Female1stDose_19_to_45_Dropdown
                      Male1stDose_45_to_60_Dropdown
                      Female1stDose_45_to_60_Dropdown
                      Male1stDose_Age60_and_above_dropdown
                      Female1stDose_Age60_and_above_dropdown
                      MaleBothDoses_19_to_45_Dropdown
                      FemaleBothDoses_19_to_45_Dropdown
                      MaleBothDoses_45_to_60_Dropdown
                      FemaleBothDoses_45_to_60_Dropdown
                      MaleBothDoses_Age60_and_above_Dropdown
                      FemaleBothDoses_Age60_and_above_Dropdown
                      total_staff_1stDose
                      total_staff_bothDose
                      vaccination_documents
                      total_staff_1stDose_Dropdown
                      total_staff_1stDose_Dropdown
                      FemaleBothDoses_Age60_and_above_Dropdown
                    }
                  }
                }
                covid_19_hpc_rtis {
                  data {
                    id
                    attributes {
                      Regular_Parole
                      Emergency_Parole
                      Special_Parole
                      Permanent_Parole
                      Premature_Release
                      Bail
                      Transfer_to_Open_prison
                      Temporary_prison
                      Regular_Parole_Dropdown
                      Emergency_Parole_Dropdown
                      Special_Parole_Dropdown
                      Permanent_Parole_dropdown
                      Premature_Release_dropdown
                      Bail_Dropdown
                      Transfer_to_Open_prison_Dropdown
                      Temporary_prison_Dropdown
                      released_on_hpc_recommendation
                      minutes_provided
                      minutes
                      mom_information {
                        minutes_of_meetings
                        Date
                      }
                    }
                  }
                }
                covid_19_testing_rtis {
                  data {
                    id
                    attributes {
                      total_prisoner1
                      total_prisoner2
                      total_prisoner3
                      total_prisoner4
                      date1
                      date2
                      date3
                      date4
                      prison_capacity
                      Number_of_Medical_Staff
                      Full_time_doctors_male
                      Full_time_doctors_Female
                      visiting_doctors_male
                      visiting_doctors_Female
                      specialist_male
                      specialist_female
                      weekly_visits_by_medicalStaff
                      total_prisoner1_Dropdown
                      total_prisoner2_Dropdown
                      total_prisoner3_Dropdown
                      total_prisoner4_Dropdown
                      prison_capacity_Dropdown
                      Number_of_Medical_Staff_Dropdown
                      Full_time_doctors_male_Dropdown
                      Full_time_doctors_Female_dropdown
                      visiting_doctors_male_dropdown
                      visiting_doctors_Female_Dropdown
                      specialist_male_Dropdown
                      specialist_female_Dropdown
                      weekly_visits_by_medicalStaff_Dropdown
                      prison_capacity
                      prison_capacity_Dropdown
                      weekly_visits_by_medicalStaff
                      weekly_visits_by_medicalStaff_Dropdown
                      nearest_medical_center
                      emergency_nearest_medical_center
                      other_medical_staff
                    }
                  }
                }
                covid_19_testing_rti_prisoners {
                  data {
                    id
                    attributes {
                      Testing_RAT
                      Testing_RT_PCR
                      prisoners_tested
                      prisoners_Infected
                      Treated
                      Shifted
                      Recovered
                      Succumbed
                      tested_multiple_times
                      Testing_RAT_Dropdown
                      Testing_RT_PCR_Dropdown
                      prisoners_tested_Dropdown
                      prisoners_Infected_dropdown
                      Treated_dropdown
                      Shifted_Dropdown
                      Recovered_Dropdown
                      Succumbed_Dropdown
                      tested_multiple_times_Dropdown
                    }
                  }
                }
                covid_19_testing_rti_prison_staffs {
                  data {
                    id
                    attributes {
                      Testing_RAT
                      Testing_RT_PCR
                      prisonStaff_tested
                      Infected
                      Treated
                      Shifted
                      Recovered
                      Succumbed
                      total_prison_staff
                      Testing_RAT_Dropdown
                      Testing_RT_PCR_Dropdown
                      prisonStaff_tested_Dropdown
                      Infected_dropdown
                      Treated_dropdown
                      Shifted_Dropdown
                      Recovered_Dropdown
                      Succumbed_Dropdown
                      total_prison_staff_Dropdown
                      people_tested_outside
                      People_Tested_Outside_Dropdown
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    meta {
      pagination {
        page
        pageSize
      }
    }
  }
}
`;

const states = ["West Bengal", "Maharashtra", "Karnataka", "Bihar", "Uttar Pradesh", "Uttrakhand"];

export default function () {
  const url = 'https://uat-cms.paar.org.in/graphql';

  for (let state of states) {
    let variables = {
      selectedState: state,
    };

    let res = http.post(url, JSON.stringify({ query, variables }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time is < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1); // Adjust sleep time based on your testing needs
  }
}
