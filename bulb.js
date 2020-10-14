'use strict';

var Emergency = '0';
var ConfigSwitch = false;
var NoEmergency = false;
var rw_Characteristic = null;

function onConnected() {
    document.querySelector('.connect-button').classList.add('hidden');
    document.querySelector('.mdl-switch').classList.add('hidden');
    document.querySelector('.power-button').classList.remove('hidden');
    if(ConfigSwitch )
    {
      document.querySelector('.color-buttons').classList.remove('hidden');
      document.querySelector('.mic-button').classList.remove('hidden');
    }
    else
      document.querySelector('.color-buttons2').classList.remove('hidden');
     

    NoEmergency = true;
}

function onDisconnected() {
    document.querySelector('.connect-button').classList.remove('hidden');
    document.querySelector('.mdl-switch').classList.remove('hidden');
    document.querySelector('.color-buttons').classList.add('hidden');
    document.querySelector('.mic-button').classList.add('hidden');
    document.querySelector('.power-button').classList.add('hidden'); 
     document.querySelector('.color-buttons2').classList.add('hidden');
     
}

function connect() {
    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice(
        {
            filters: [{ services: ['f9ad3f0b-bd11-4092-92da-d25d81fc2485'] }]
        })
        .then(device => {
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
            device.addEventListener('gattserverdisconnected', onDisconnected)
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Getting Service f9ad3f0b-bd11-4092-92da-d25d81fc2485');
            return server.getPrimaryService('f9ad3f0b-bd11-4092-92da-d25d81fc2485');
        })
        .then(service => {
            console.log('Getting Characteristic f80d2cfb-f2b3-4caf-af70-3183fa4e0c6a');
            return service.getCharacteristic('f80d2cfb-f2b3-4caf-af70-3183fa4e0c6a');
        })
        .then(characteristic => {
            console.log('All ready!');
            rw_Characteristic = characteristic;
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

function EmergencyOff() {
  let data = new Uint8Array([0x2A, 0x4E, 0x2C, 0x30, 0x2C, 0x30, 0x2C, 0x30]);
  return rw_Characteristic.writeValue(data)
      .catch(err => console.log('Error when powering on! ', err))
      .then(() => {
          NoEmergency = true;
          toggleButtons();
      });
}

function EmergencyOn() {
  let data = new Uint8Array([0x21, 0x45, 0x2C, 0x30, 0x2C, 0x30, 0x2C, 0x30]);
  return rw_Characteristic.writeValue(data)
      .catch(err => console.log('Error when switching off! ', err))
      .then(() => {
          NoEmergency = false;
          toggleButtons();
      });
}

function togglePower() {
    if (NoEmergency) {
        EmergencyOn();
        document.getElementById('EmergencyStopLabel').innerHTML = "Stopped"
        
    } else {
        EmergencyOff();
        document.getElementById('EmergencyStopLabel').innerHTML = ""
    }
}

function toggleButtons() {
    Array.from(document.querySelectorAll('.color-buttons button')).forEach(function(colorButton) {
      colorButton.disabled = !NoEmergency;
    });

    Array.from(document.querySelectorAll('.color-buttons2 button')).forEach(function(colorButton) {
      colorButton.disabled = !NoEmergency;
    });

    Array.from(document.querySelectorAll('.mic-button')).forEach(function(tag) {
      tag.disabled = !NoEmergency;
    });

    // document.querySelector('.mic-button button').disabled = !NoEmergency;
}

function ConfigSwitchLogic()
{
    var swPos = document.querySelector('input[id="switch1"]');
    if(swPos.checked) {
        ConfigSwitch=true;
      } else {
        ConfigSwitch=false;
      }

      console.log(ConfigSwitch);
  
}

function run() {
    var speedVal = document.getElementById('speed').innerHTML;
    var duration = document.getElementById('dur_s').innerHTML;
    var direction = '0';
    var dirSwitch = document.querySelector('input[id="togBtn"]');
    var str="";
    // var otherText = document.querySelector('input[id="otherValue"]');
    // otherText.style.visibility = 'hidden';

      if(dirSwitch.checked) {
        direction='C';
      } else {
        direction='A';
      }

      if(NoEmergency)
        Emergency = 'N'
      else
        Emergency = 'E'

    str="*".concat(Emergency,",",speedVal,",",duration,",",direction);

    return sendData(str)
        .then(() => console.log(str));
}
function runcw(){
  var str = "@CC"
  return sendData(str)
        .then(() => console.log(str));
}

function runacw(){
  var str = "@AA"
  return sendData(str)
        .then(() => console.log(str));
}

function sendData(stringVal) {

    let j = 0;
    const buffer = new ArrayBuffer(13);
    const view1 = new DataView(buffer);
    for (let i = 0; i < stringVal.length; i++) {
      view1.setUint8(j++, stringVal.charCodeAt(i));
    }
    return rw_Characteristic.writeValue(view1)
        .catch(err => console.log('Error when writing value! ', err));
}

// function setColor(red, green, blue) {
//     let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
//     return rw_Characteristic.writeValue(data)
//         .catch(err => console.log('Error when writing value! ', err));
// }

// function red() {
//     return setColor(255, 0, 0)
//         .then(() => console.log('Color set to Red'));
// }

// function green() {
//     return setColor(0, 255, 0)
//         .then(() => console.log('Color set to Green'));
// }

// function blue() {
//     return setColor(0, 0, 255)
//         .then(() => console.log('Color set to Blue'));
// }

// Install service worker - for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js');
}
