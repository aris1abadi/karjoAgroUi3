import { writable, get } from "svelte/store";
import { persisted } from 'svelte-persisted-store'
import mqtt from "mqtt";
import { dev } from "$app/environment";


export const networkSelect = {
  MODE_OFF: 'Offline',
  MODE_LOCAL: 'Local',
  MODE_BT: 'Bluethooth',
  MODE_MQTT: 'Online'
}
//let setupMode = 0; //0 mode set task,1 mode set device,3 mode alert
export const modalMode=writable({
  
  SET_TASK:0,
  SET_DEVICE:1,
  ALERT:2,

})


export const taskMode = {
  MODE_TEMPERATURE: 0,
  MODE_HUMIDITY: 1,
  MODE_LENGAS: 2,
  MODE_INTERMITTEN: 3,
  MODE_MIX: 4,
}


export const msgType = {
  KONTROL: 0,
  TASK: 1,
  AKTUATOR: 2,
  SENSOR: 3,
};

export const sensorType = {
  NODE_GATEWAY: 0,
  NODE_TEMPERATURE: 1,
  NODE_HUMIDITY: 2,
  NODE_SOIL_MOISTURE: 3,
  NODE_DISTANCE: 4,
  NODE_BATTERY: 5,
  NODE_RELAY1: 6,
  NODE_RELAY2: 7,
  NODE_RELAY3: 8,
  NODE_RELAY4: 9,
  NODE_RELAY5: 10,
  NODE_RELAY6: 11,
  NODE_RELAY7: 12,
  NODE_RELAY8: 13,
  NODE_DISPLAY: 14
}

export let flowAPersen = writable(50);
export let flowBPersen = writable(0);
export let flowCPersen = writable(0);
export let mixOutPersen = writable(0);

export const mqttClient = writable(null);
export const mqttData = writable({});

let bleConnected = false;
export let bleIsConnected = writable(false);
export let logDisplay = writable("log console\n");
export let mqttIsConnected = writable(false);

export let networkMode = writable(networkSelect.MODE_OFF);
//export let networkMode = writable(networkSelect.MODE_LOCAL);

export const kontrolID = persisted('kontrolID', 'KA-E8C9')
export let networkSetup = writable({ mode: false, ssid: "", password: "", mqttBroker: "", mqttPort: 1883 })

export let spinnerShow=  writable([false,false,false,false]);

export let isStarted = writable(false);

export let waterLevel = 0;
export let myTask = writable([{
  nama: 'Temperature',
  aktuator1: 1,
  aktuator2: 2,
  aktuatorMixA: 3,
  aktuatorMixB: 4,
  aktuatorMixC: 5,
  aktuatorMixOut: 6,
  aktuatorAduk: 7,
  nodeSensor: 1,
  sensorType: sensorType.NODE_TEMPERATURE,
  sensorVal: 0,
  flowSensorA: 1,
  flowSensorB: 2,
  flowSensorC: 3,
  flowMixOut: 4,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  mode: taskMode.MODE_TEMPERATURE,//task mode
  batasBawah: 30,
  batasAtas: 35,
  timer1: '0,0,0',//format HH,MM,durasi
  timer2: '0,0,0',//format HH:MM,durasi
  timer3: '0,0,0',//format HH:MM,durasi
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air',
  enable: 0,
}, {
  nama: 'Humidity',
  aktuator1: 1,
  aktuator2: 2,
  aktuatorMixA: 3,
  aktuatorMixB: 4,
  aktuatorMixC: 5,
  aktuatorMixOut: 6,
  aktuatorAduk: 7,
  nodeSensor: 1,
  sensorType: sensorType.NODE_HUMIDITY,
  sensorVal: 0,
  flowSensorA: 1,
  flowSensorB: 2,
  flowSensorC: 3,
  flowMixOut: 4,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  mode: taskMode.MODE_HUMIDITY,//task mode
  batasBawah: 30,
  batasAtas: 35,
  timer1: '0,0,0',//format HH,MM,durasi
  timer2: '0,0,0',//format HH:MM,durasi
  timer3: '0,0,0',//format HH:MM,durasi
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air',
  enable: 0,
}, {
  nama: 'Lengas',
  aktuator1: 1,
  aktuator2: 2,
  aktuatorMixA: 3,
  aktuatorMixB: 4,
  aktuatorMixC: 5,
  aktuatorMixOut: 6,
  aktuatorAduk: 7,
  nodeSensor: 1,
  sensorType: sensorType.NODE_SOIL_MOISTURE,
  sensorVal: 0,
  flowSensorA: 1,
  flowSensorB: 2,
  flowSensorC: 3,
  flowMixOut: 4,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  mode: taskMode.MODE_LENGAS,//task mode
  batasBawah: 30,
  batasAtas: 35,
  timer1: '0,0,0',//format HH,MM,durasi
  timer2: '0,0,0',//format HH:MM,durasi
  timer3: '0,0,0',//format HH:MM,durasi
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air',
  enable: 0,
}, {
  nama: 'Intermitten',
  aktuator1: 1,
  aktuator2: 2,
  aktuatorMixA: 3,
  aktuatorMixB: 4,
  aktuatorMixC: 5,
  aktuatorMixOut: 6,
  aktuatorAduk: 7,
  nodeSensor: 1,
  sensorType: sensorType.NODE_DISTANCE,
  sensorVal: 0,
  flowSensorA: 1,
  flowSensorB: 2,
  flowSensorC: 3,
  flowMixOut: 4,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  mode: taskMode.MODE_INTERMITTEN,//task mode
  batasBawah: -1,
  batasAtas: 5,
  timer1: '0,0,0',//format HH,MM,durasi
  timer2: '0,0,0',//format HH:MM,durasi
  timer3: '0,0,0',//format HH:MM,durasi
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air',
  enable: 0,
}]);

/*
export let dataTask = writable([{
  enable: 0,
  aktuatorUse1: 1,
  aktuatorUse2: 2,
  status: 0,
  jadwal: '0',
  sensorUse: 1,     // default sensor  
  sensorUseType: sensorType.TEMPERATURE,
  targetBawah: 30,
  targetAtas: 32,
  taskMode: taskMode.MODE_TEMPERATURE,
  nama: 'Temperature',
  sensorValue: 0,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  targetMixOut: 0,
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air'
}, {
  enable: 0,
  aktuatorUse1: 1,
  aktuatorUse2: 2,
  status: 0,
  jadwal: '0',
  sensorUse: 1,     // default sensor  
  sensorUseType: sensorType.HUMIDITY,
  targetBawah: 30,
  targetAtas: 32,
  taskMode: taskMode.MODE_HUMIDITY,
  nama: 'Humidity',
  sensorValue: 0,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  targetMixOut: 0,
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air'
}, {
  enable: 0,
  aktuatorUse1: 1,
  aktuatorUse2: 2,
  status: 0,
  jadwal: '0',
  sensorUse: 1,     // default sensor  
  sensorUseType: sensorType.LENGAS,
  targetBawah: 30,
  targetAtas: 32,
  taskMode: taskMode.MODE_LENGAS,
  nama: 'Lengas',
  sensorValue: 0,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  targetMixOut: 0,
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air'
}, {
  enable: 0,
  aktuatorUse1: 1,
  aktuatorUse2: 2,
  status: 0,
  jadwal: '0',
  sensorUse: 1,     // default sensor  
  sensorUseType: sensorType.LENGAS_REED,
  targetBawah: 0,
  targetAtas: 15,
  taskMode: taskMode.MODE_INTERMITTEN,
  nama: 'Intermittent',
  sensorValue: 0,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  targetMixOut: 0,
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air'
}]);
*/




const subMqtt = "abadinet-out/" + get(kontrolID) + "/#";
const pubMqtt = "abadinet-in/" + get(kontrolID) + "/";
let clientId = "CL" + Math.random().toString(16).substr(2, 4).toUpperCase();
//const host = 'ws://abadinet.my.id:2020'
//const host = 'wss://node-red.balingtansmart.my.id/ws'
//const host =  'ws://'+ get(brokerUseStore) + '/mqtt:' + get(brokerPortUseStore);
const brokerUrl = "wss://mqtt.eclipseprojects.io/mqtt:443";
//const brokerUrl = "ws://mqtt.eclipseprojects.io/mqtt:80";

let lastMsg = null;
let myTaskNow = myTask;
let mqttConnected = false
let client = null;



const options = {
  keepalive: 30,
  clientId,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
};

const dtSub = myTask.subscribe((data) => {
  myTaskNow = data; // Panggil fungsi untuk memperbarui sensorData
});

const mqttSub = mqttIsConnected.subscribe((data) => {
  mqttConnected = data; // Panggil fungsi untuk memperbarui sensorData
});

let error = null;    // Untuk menangani error jika EventSource tidak didukung


// Fungsi untuk menginisialisasi MQTT Client (hanya sekali)
// @ts-ignore
export function initMqtt() {
  client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    mqttConnected = true
    mqttIsConnected.set(true)
    console.log("Connected to MQTT broker");
    client.subscribe(subMqtt, { qos: 0 });
    let pubStatus = pubMqtt + "kontrol/0/status";
    console.log("mqtt conected");
    let getmyTask = pubMqtt + "0/0/getAllTask";
    mqttClient.set(client); // Set mqttClient di davalue=""lam store
    networkMode.set(networkSelect.MODE_MQTT)
    isStarted.set(true)
    if(bleConnected){
      bleConnectionToggle();
    }

    //cekClientId();

    client.publish(pubStatus, clientId, { qos: 0, retain: false });
    client.publish(getmyTask, "1", { qos: 0, retain: false });
    //kirimMsg("kontrol", 0, "getAllTask", "1")
  });

  client.on("message", (topic, payload) => {
    cekMqttMsg(topic, payload.toString())
    mqttData.update((data) => ({
      ...data,
      topic,
      msg: payload.toString(), // Update data berdasarkan topik
    }));
  });

  client.on('close', () => {
    mqttConnected = false;
    mqttIsConnected.set(false)
    console.log('Disconnected from MQTT broker');
    networkMode.set(networkSelect.MODE_OFF)
    isStarted.set(false)
  });


}

function mqttDisconnect() {
  if (mqttConnected && client) {
    client.end();
    mqttConnected = false;
  }
}

export function getLocalStatus() {
  const net = get(networkMode);
  if (net === networkSelect.MODE_LOCAL) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/cmd", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        console.log("Response from kontrol:", xhttp.responseText);
        let resp = xhttp.responseText.split('@');
        cekMqttMsg(resp[0], resp[1]);
      }
    };

    // Kirim data dengan dua parameter
    var data = "topic=abadinet-in/KA-E8C9/0/1/getAllStatus&msg=1"
    xhttp.send(data);
  }

}

export function kirimMsg(type, num, cmd, msg) {

  const ms = pubMqtt + type + "/" + num + "/" + cmd;
  const bleMsg = ms + ";" + msg + ";";
  const net = get(networkMode);
  console.log(bleMsg);

  if (net === networkSelect.MODE_MQTT) {

    mqttClient.subscribe((client) => {
      if (client) {
        client.publish(ms, msg, { qos: 0, retain: false });
        return true
      } else {
        console.error("MQTT client is not connected");
        alert("!!! Tidak terhubung ke Server !!!")
        return false
      }
    });
  } else if (net === networkSelect.MODE_BT) {
    if (bleConnected) {
      nusSendString(bleMsg)
      return true

    } else {
      alert("!!! Tidak terhubung ke Bluethoooth !!!")
      return false
    }
  } else if (net === networkSelect.MODE_LOCAL) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/cmd", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //text/html
    //xhttp.setRequestHeader("Content-Type", "text/html");

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        console.log("Response from kontrol:", xhttp.responseText);
        let resp = xhttp.responseText.split('@');
        cekMqttMsg(resp[0], resp[1]);
        return true;
      } else {
        console.error("Tidak dapat terhubung ke server, status:", xhttp.status);
        return false
      }

    };


    // Menangani kesalahan koneksi
    xhttp.onerror = function () {
      console.error("Terjadi kesalahan koneksi. Tidak dapat terhubung ke server.");
      return false
    };

    // Kirim data dengan dua parameter
    var data = "topic=" + ms + "&msg=" + msg;
    xhttp.send(data);
    console.log("kirim via local " + ms + " msg:" + msg)
    return true
  } else {
    alert("!!! Tidak terhubung ke Kontroller !!!")
    return false
  }
}

function cekMqttMsg(topic, msg_payload) {
  //console.log("Sensor Data updated:", data);

  //const splitMsg = data.split(": '")
  //const topic = data.topic;
  //const msg_payload = data.msg;
  //abadinet-in/KA-8CE9/1/0/enable;1;
  //console.log(topic + '  >  ' + msg_payload)
  const topicMqtt = topic ? topic.split("/") : [];
  if (topicMqtt.length > 0) {
    const serverId = topicMqtt[1];
    const typeTask = parseInt(topicMqtt[2]);
    const numberTask = topicMqtt[3];
    const msg_cmd = topicMqtt[4];

    if (typeTask === msgType.KONTROL) {
      if (msg_cmd === "infoAllTask") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          let msgSplit = msg_payload.split(";");
          let newArray = []; // Array sementara untuk menampung data

          // myTask.set([]); // Kosongkan store sebelum diisi ulang

          for (let i = 0; i < msgSplit.length; i++) {
            try {
              let jsonData = JSON.parse(msgSplit[i]); // Parse JSON              
              let nm = jsonData.nama;
              jsonData.nama = nm.trim();
              newArray.push(jsonData); // Simpan data di array sementara
              //console.log(jsonData);  // Debug: Tampilkan objek JSON
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
          myTask.set(newArray); // Update store sekali setelah loop selesai
        
        }
      } else if (msg_cmd === "sensorValue") {
       
          myTask.update(task => {
            // Ubah nilai `a` pada elemen pertama
            task[numberTask] = { ...task[numberTask],sensorVal: parseFloat(msg_payload)}; // Ganti nilai a
            return task; // Kembalikan array yang telah dimodifikasi
          });


         
        
       
      } else if (msg_cmd === "getNetwork") {
        const net = JSON.parse(msg_payload)
        if (net.mode === 0) {
          networkSetup.mode = false
        } else {
          networkSetup.mode = true
        }

        networkSetup.ssid = net.ssid
        networkSetup.password = net.password
        networkSetup.mqttBroker = net.mqttBroker
        networkSetup.mqttPort = net.mqttPort
        console.log(JSON.stringify(networkSetup))
      }
    } else if (typeTask === msgType.TASK) {
      if (msg_cmd === "sensorValue") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], sensorVal: parseInt(msg_payload) };
          return task;
        });
        //water level
        
        
      } else if (msg_cmd === "enable") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], enable: parseInt(msg_payload) };
          return task;
        });
        spinnerShow.update(spin => {
          spin[numberTask] = false;
          return spin;
        });
        
      } else if (msg_cmd === "aktuator1") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], aktuator1: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "aktuator2") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], aktuator2: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "jadwal") {
        // myTaskNow[numberTask].aktuatorUse2 = parseInt(msg_payload);
      } else if (msg_cmd === "nodeSensor") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], nodeSensor: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "batasBawah") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], batasBawah: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "batasAtas") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], batasAtas: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "targetMixA") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], targetMixA: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "targetMixB") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], targetMixB: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "targetMixC") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], targetMixC: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "mixingTarget") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], mixingTarget: parseInt(msg_payload) };
          return task;
        });
      }

    } else {


    }
  }
}



//bluethoot
const bleNusServiceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const bleNusCharRXUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const bleNusCharTXUUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const MTU = 20;

var bleDevice;
var bleServer;
var nusService;
var rxCharacteristic;
var txCharacteristic;
let sendCount = 0;
let btBuff = "";



export function mqttConnectionToggle() {
  if (mqttConnected) {
    mqttDisconnect()
    console.log("disconect mqtt")
  } else {
    console.log("connect mqtt")
    initMqtt()

  }
}

export function bleConnectionToggle() {
  if (bleConnected) {
    disconnect();
  } else {
    connect();
  }
}

async function connect() {
  if (!navigator.bluetooth) {
    logDisplay += "WebBluetooth API is not available.\r\n";
    return;
  }
  logDisplay += "Requesting Bluetooth Device...\n";
  navigator.bluetooth
    .requestDevice({
      //filters: [{services: []}]
      optionalServices: [bleNusServiceUUID],
      acceptAllDevices: true,
    })
    .then((device) => {
      bleDevice = device;
      logDisplay += "Found " + device.name;
      logDisplay += "Connecting to GATT Server...\n";
      bleDevice.addEventListener(
        "gattserverdisconnected",
        onDisconnected,
      );
      return device.gatt.connect();
    })
    .then((server) => {
      logDisplay += "Locate NUS service\n";
      return server.getPrimaryService(bleNusServiceUUID);
    })
    .then((service) => {
      nusService = service;
      logDisplay += "Found NUS service: " + service.uuid;
    })
    .then(() => {
      logDisplay += "Locate RX characteristic\n";
      return nusService.getCharacteristic(bleNusCharRXUUID);
    })
    .then((characteristic) => {
      rxCharacteristic = characteristic;
      logDisplay += "Found RX characteristic\n";
    })
    .then(() => {
      logDisplay += "Locate TX characteristic\n";
      return nusService.getCharacteristic(bleNusCharTXUUID);
    })
    .then((characteristic) => {
      txCharacteristic = characteristic;
      logDisplay += "Found TX characteristic\n";
    })
    .then(() => {
      logDisplay += "Enable notifications\n";
      return txCharacteristic.startNotifications();
    })
    .then(() => {
      logDisplay += "Notifications started\n";
      txCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleNotifications,
      );
      bleConnected = true;
      bleIsConnected.set(true)
      networkMode.set(networkSelect.MODE_BT)
      isStarted.set(true)
      ////window.term_.io.println('\r\n' + bleDevice.name + ' Connected.\n'
      tes();
      //setConnButtonState(true);
    })
    .catch((error) => {
      logDisplay += error;
      //window.term_.io.println('' + error);
      if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
      }
    });
}

function disconnect() {
  if (!bleDevice) {
    logDisplay += "No Bluetooth Device connected...\n";
    return;
  }
  logDisplay += "Disconnecting from Bluetooth Device...\n";
  if (bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect();
    bleConnected = false;
    bleIsConnected.set(false)
    networkMode.set(networkSelect.MODE_OFF)
    isStarted.set(false)
    //setConnButtonState(false);
    logDisplay +=
      "Bluetooth Device connected: " + bleDevice.gatt.connected;
  } else {
    logDisplay += "> Bluetooth Device is already disconnected\n";
  }
}

function onDisconnected() {
  bleConnected = false;
  bleIsConnected.set(false)
  networkMode.set(networkSelect.MODE_OFF)
  isStarted.set(false)
  logDisplay += "\r\n" + bleDevice.name + " Disconnected.";
}

function handleNotifications(event) {
  logDisplay += "btMsg:\n";
  let value = event.target.value;
  // Convert raw data bytes to character values and use these to
  // construct a string.
  let chr = "";
  let endMsg = false;
  for (let i = 0; i < value.byteLength; i++) {
    chr = String.fromCharCode(value.getUint8(i));
    btBuff += chr;
    if (chr == "\n") {
      endMsg = true;

      break;
    }
  }
  if (endMsg) {
    if (btBuff.length > 5) {
      logDisplay += btBuff;

      let btMsgSplit = btBuff.split('@')
      const topic = btMsgSplit[0]
      const msg = btMsgSplit[1]

      cekMqttMsg(topic, msg)

    }
    btBuff = "";
  }
}

function nusSendString(s) {
  if (bleDevice && bleDevice.gatt.connected) {
    //logDisplay += 'send: ' + s;
    s += "\n";
    let val_arr = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) {
      let val = s[i].charCodeAt(0);
      val_arr[i] = val;
    }
    sendNextChunk(val_arr);
  } else {
    logDisplay += "Not connected to a device yet.";
  }
}

function sendNextChunk(a) {
  let chunk = a.slice(0, MTU);
  rxCharacteristic.writeValue(chunk).then(function () {
    if (a.length > MTU) {
      sendNextChunk(a.slice(MTU));
    }
  });
}

export function tes() {
  let st = "abadinet-in/AB5578/kontrol/0/getAllTask;1;";
  nusSendString(st);
  sendCount++;
}
/*

export function kirimMsg(type, num, cmd, msg) {
    let ms = pubMqtt + type + '/' + num + '/' + cmd
    const bleMsg = ms + ';' + msg + '\n'

    mqttClient.publish(ms, msg, { qos: 0, retain: false })

}
    */
