
var encounters = ["Stress","PTSD","Speech","Anxiety","Depression","Headache","Sleep","Audiology","Vision","Neurologic","Alzheimer","Cognitive","PCS","Endocrine","Skull_inj","NON_skull_inj"];

function EHRdataset(callback) {
    var parsedCSV = d3.csv.parse(dataset);

    var patients = [];
    var maxLeft = 0, maxRight = 0;
    var leftItemCount, rightItemCount;
    var maxPreTBI = 0, maxPostTBI = 0;
    // Assuming data is pre-sorted by PatientID and then by Days_From1stTBI
    for(var patient in parsedCSV) {

        if (patients.length === 0 || patients[patients.length - 1].patientID !== parsedCSV[patient].PatientID){
            leftItemCount = rightItemCount = 0;
            patients.push({
                patientID: parsedCSV[patient].PatientID,
                gender: parsedCSV[patient].Gender,
                age: parsedCSV[patient].Age,
                dateOfInjury: new Date(parsedCSV[patient]["Date of Injury"]),
                leftItems: 0,
                encounters: []
            });
        }

        var thisPatient = patients[patients.length - 1];
        var data = null;

        if (thisPatient.encounters.length > 0
            && thisPatient.encounters[thisPatient.encounters.length - 1].daysFromTBI === (+parsedCSV[patient].Days_From1stTBI)) {
            data = thisPatient.encounters[thisPatient.encounters.length - 1];
        } else {
            data = {
                encounters: []
            };
        }

        for(var i = 0; i < encounters.length; i++) {
            if(parsedCSV[patient][encounters[i]] !== "0") {
                data.daysFromTBI = (+parsedCSV[patient].Days_From1stTBI);

                if(data.encounters.indexOf(encounters[i]) === -1) {
                    data.encounters.push(encounters[i]);
                }
            }
        }

        if (data.encounters.length > 0 &&
            (thisPatient.encounters.length === 0 || thisPatient.encounters[thisPatient.encounters.length - 1] !== data)) {
            if (data.daysFromTBI < 0) {
                leftItemCount++;
                thisPatient.leftItems = leftItemCount;
            } else {
                rightItemCount++;
            }
            maxLeft = Math.max(maxLeft, leftItemCount);
            maxRight = Math.max(maxRight, rightItemCount);
            maxPreTBI = Math.min(data.daysFromTBI, maxPreTBI);
            maxPostTBI = Math.max(data.daysFromTBI, maxPostTBI);
            thisPatient.encounters.push(data);
        }
    }

    patients.sort(function(a, b){
        var diff = b.encounters.length - a.encounters.length;
        if (diff < 0){
            return -1;
        } else if (diff === 0) {
            return 0
        } else {
            return 1;
        }
    });

    var d3Data = {
        maxLeft: maxLeft,
        maxRight: maxRight,
        maxPreTBIDays: -maxPreTBI,
        maxPostTBIDays: maxPostTBI,
        patients: patients
    };

    callback && callback(d3Data);
}