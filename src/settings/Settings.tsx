import * as React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import { ObsAudioDevice } from 'main/obsAudioDeviceUtils';

const ipc = window.electron.ipcRenderer;

export default function Settings() {

  /**
   * React state variables.
   */
  const [state, useState] = React.useState({
    storagePath: window.electron.store.get('storage-path'),
    logPath: window.electron.store.get('log-path'),
    maxStorage: window.electron.store.get('max-storage'),
    monitorIndex: window.electron.store.get('monitor-index'),
    audioInputDevice: window.electron.store.get('audio-input-device', 'all'),
    audioOutputDevice: window.electron.store.get('audio-output-device', 'all'),
    startUp: window.electron.store.get('start-up') === 'true',
  });

  /**
   * These settings are saved when 'Update' is clicked.
   */
  const stateKeyToSettingKeyMap = {
    'storagePath': 'storage-path',
    'logPath': 'log-path',
    'maxStorage': 'max-storage',
    'monitorIndex': 'monitor-index',
    'audioInputDevice': 'audio-input-device',
    'audioOutputDevice': 'audio-output-device',
    'startUp': 'start-up',
  };
  type StateToSettingKeyMapKey = keyof typeof stateKeyToSettingKeyMap;

  /**
   * Close window.
   */
  const closeSettings = () => {
    ipc.sendMessage('settingsWindow', ['quit']);
  }

  /**
   * Save values. 
   */
  const saveSettings = () => {
    Object.values(stateKeyToSettingKeyMap).forEach(saveItem);

    ipc.sendMessage('settingsWindow', ['update']);
  }

  /**
   * Close window.
   */
  const saveItem = (setting: string) => {
    if (!document) return;
    const element = document.getElementById(setting); 
    if (!element) return;
    let value;

    if (setting === "start-up") {
      value = element.getAttribute("aria-pressed");
      ipc.sendMessage("settingsWindow", ["startup", value]);
    } else {
      value = element.getAttribute("value");
    }

    if (value) window.electron.store.set(setting, value);
  }
  
  /**
   * Dialog window folder selection.
   */
  const openStoragePathDialog = () => {
    ipc.sendMessage("settingsWindow", ["openPathDialog", "storagePath"]);
  }

  const openLogPathDialog = () => {
    ipc.sendMessage("settingsWindow", ["openPathDialog", "logPath"]);
  }


  /**
   * setSetting, why not just use react state hook?
   */
   const setSetting = (stateKey: StateToSettingKeyMapKey, value: any) => {
    const settingKey = stateKeyToSettingKeyMap[stateKey]
    const element = document.getElementById(settingKey)

    if (!element) {
      return;
    }

    console.log(`[SettingsWindow] Set setting '${settingKey}' to '${value}'`)
    element.setAttribute("value", value);

    useState((prevState) => ({...prevState, [stateKey]: value}))
  }

  /**
   * Event handler when user selects an option in dialog window.
   */
  React.useEffect(() => {
    ipc.on('settingsWindow', (args: any) => {
      if (args[0] === "pathSelected") setSetting(args[1], args[2]);
    });
  }, []);

  const audioDevices = ipc.sendSync('getAudioDevices', []);
  const availableAudioDevices = {
    input: [
      new ObsAudioDevice('none', '(None: no microphone input will be recorded)'),
      new ObsAudioDevice('all', '(All)'),
      ...audioDevices.input,
    ],
    output: [
      new ObsAudioDevice('none', '(None: no sound will be recorded)'),
      new ObsAudioDevice('all', '(All)'),
      ...audioDevices.output,
    ]
  };

  return (
    <div className="container">
      <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
        <div className="card h-100">
          <div className="card-body">
            <div className="row gutters">
              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label> Storage Path </label>
                  <input type="text" className="form-control" id="storage-path" placeholder={state.storagePath} onClick={openStoragePathDialog}/>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label> Log Path </label>
                  <input type="text" className="form-control" id="log-path" placeholder={state.logPath} onClick={openLogPathDialog}/>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label> Max Storage (GB) </label>
                  <input type="text" id="max-storage" className="form-control" placeholder={state.maxStorage} onChange={(event) => setSetting('maxStorage', event.target.value)}/>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label> Monitor Number </label>
                  <input type="text" id="monitor-index" className="form-control" placeholder={state.monitorIndex} onChange={(event) => setSetting('monitorIndex', event.target.value)}/>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label> Record audio input from </label>
                  <select id="audio-input-device" className="form-control" value={state.audioInputDevice} onChange={(event) => setSetting('audioInputDevice', event.target.value)}>
                    { availableAudioDevices.input.map((device: ObsAudioDevice) => {
                      return (
                        <option key={ 'device_' + device.id } value={ device.id }>{ device.name }</option>
                      )
                    })}
                  </select>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label> Record audio output from </label>
                  <select id="audio-output-device" className="form-control" value={state.audioOutputDevice} onChange={(event) => setSetting('audioOutputDevice', event.target.value)}>
                    { availableAudioDevices.output.map((device: ObsAudioDevice) => {
                      return (
                        <option key={ 'device_' + device.id } value={ device.id }>{ device.name }</option>
                      )
                    })}
                  </select>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="form-group">
                  <label> Run on Startup? </label>
                  <ToggleButton
                    id="start-up"
                    size="small"
                    sx={{ border: '1px solid #bcd0f7', width: 25, height: 25, margin: 1 }}
                    value="check"
                    selected={ state.startUp }
                    onChange={ () => setSetting('startUp', !state.startUp) }
                  >
                  { state.startUp &&
                    <CheckIcon sx={{ color: '#bcd0f7' }}/>
                  }                    
                  </ToggleButton>
                </div>
              </div>
            </div>
            <div className="row gutters">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                <div className="text-center">
                  <button type="button" id="close" name="close" className="btn btn-secondary" onClick={closeSettings}>Close</button>
                  <button type="button" id="submit" name="submit" className="btn btn-primary" onClick={saveSettings}>Update</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}
