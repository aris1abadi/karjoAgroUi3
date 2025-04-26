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


export const taskMode = {
  MODE_TEMPERATURE: 0,
  MODE_HUMIDITY: 1,
  MODE_LENGAS: 2,
  MODE_INTERMITTEN: 3,
  MODE_MIX: 4,
}
export const sensorType = {
  TEMP_HUM: 0,
  TEMPERATURE: 1,
  HUMIDITY: 2,
  LENGAS: 3,
  LENGAS_LASER: 4,
  LENGAS_REED: 5,
  FLOW: 6,
  MIX: 7,
};

export const msgType={
  KONTROL:1,
  TASK:1,
  AKTUATOR:2,
  SENSOR:3,
};

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




const subMqtt = "abadinet-out/" + get(kontrolID) + "/#";
const pubMqtt = "abadinet-in/" + get(kontrolID) + "/";
let clientId = "CL" + Math.random().toString(16).substr(2, 4).toUpperCase();
//const host = 'ws://abadinet.my.id:2020'
//const host = 'wss://node-red.balingtansmart.my.id/ws'
//const host =  'ws://'+ get(brokerUseStore) + '/mqtt:' + get(brokerPortUseStore);
const brokerUrl = "wss://mqtt.eclipseprojects.io/mqtt:443";
//const brokerUrl = "ws://mqtt.eclipseprojects.io/mqtt:80";

let lastMsg = null;
let dataTaskNow = dataTask;
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

const dtSub = dataTask.subscribe((data) => {
  dataTaskNow = data; // Panggil fungsi untuk memperbarui sensorData
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
    let getDataTask = pubMqtt + "kontrol/0/getAllTask";
    mqttClient.set(client); // Set mqttClient di davalue=""lam store
    networkMode.set(networkSelect.MODE_MQTT)

    //cekClientId();

    client.publish(pubStatus, clientId, { qos: 0, retain: false });
    client.publish(getDataTask, "1", { qos: 0, retain: false });
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
  //console.log(topic + '  >  ' + msg_payload)
  const topicMqtt = topic ? topic.split("/") : [];
  if (topicMqtt.length > 0) {
    const serverId = topicMqtt[1];
    const numberTask = parseInt(topicMqtt[2]);
    const msg_idx = topicMqtt[3];
    const msg_cmd = topicMqtt[4];

    if (numberTask === 0) {
      if (msg_cmd === "getAllTask") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          let msgSplit = msg_payload.split(";");
          let newArray = []; // Array sementara untuk menampung data

          //dataTask.set([]); // Kosongkan store sebelum diisi ulang

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
          dataTask.set(newArray); // Update store sekali setelah loop selesai

          //console.log(dataTask)
        }
      } else if (msg_cmd === "getAllStatus") {
        let msgSplit = msg_payload.split(";");
        // let statusArray = []; // Array sementara untuk menampung data

        //dataTask.set([]); // Kosongkan store sebelum diisi ulang

        for (let i = 0; i < msgSplit.length; i++) {
          try {
            let jsonData = JSON.parse(msgSplit[i]); // Parse JSON  
            dataTask.update(task => {
              // Ubah nilai `a` pada elemen pertama
              task[i] = { ...task[i], enable: jsonData.enable, status: jsonData.status, sensorValue: jsonData.sensorValue, targetBawah: jsonData.targetBawah, targetAtas: jsonData.targetAtas, taskMode: jsonData.taskMode, nama: jsonData.nama }; // Ganti nilai a
              return task; // Kembalikan array yang telah dimodifikasi
            });


            //statusArray.push(jsonData); // Simpan data di array sementara
            //console.log(jsonData);  // Debug: Tampilkan objek JSON
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      } else if (msg_cmd === "getNetwork") {
        const net = JSON.parse(msg_payload)
        if(net.mode === 0){
          networkSetup.mode = false
        }else{
          networkSetup.mode = true
        }

        networkSetup.ssid = net.ssid
        networkSetup.password = net.password
        networkSetup.mqttBroker = net.mqttBroker
        networkSetup.mqttPort = net.mqttPort
        console.log(JSON.stringify(networkSetup))
      }
    } else {

      for (let i = 0; i < dataTaskNow.length; i++) {

        // console.log("Nama :" + namaType + ' > ' + numberTask)
        if ((i + 1) == numberTask) {
          if (msg_cmd === "sensorValue") {
            dataTask.update(task => {
              task[i] = { ...task[i], sensorValue: parseFloat(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "enable") {
            dataTask.update(task => {
              task[i] = { ...task[i], enable: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "aktuatorUse1") {
            dataTask.update(task => {
              task[i] = { ...task[i], aktuatorUse1: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "aktuatorUse2") {
            dataTask.update(task => {
              task[i] = { ...task[i], aktuatorUse2: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "jadwal") {
            //dataTaskNow[i].aktuatorUse2 = parseInt(msg_payload);
          } else if (msg_cmd === "sensorUse") {
            dataTask.update(task => {
              task[i] = { ...task[i], sensorUse: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "targetBawah") {
            dataTask.update(task => {
              task[i] = { ...task[i], targetBawah: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "targetAtas") {
            dataTask.update(task => {
              task[i] = { ...task[i], targetAtas: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "targetMixA") {
            dataTask.update(task => {
              task[i] = { ...task[i], targetMixA: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "targetMixB") {
            dataTask.update(task => {
              task[i] = { ...task[i], targetMixB: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "targetMixC") {
            dataTask.update(task => {
              task[i] = { ...task[i], targetMixC: parseInt(msg_payload) };
              return task;
            });
          } else if (msg_cmd === "mixingTarget") {
            dataTask.update(task => {
              task[i] = { ...task[i], mixingTarget: parseInt(msg_payload) };
              return task;
            });
          }
          break;
        }

      }
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
