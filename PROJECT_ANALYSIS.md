# Neerchedi Project Analysis

## 1. Project Overview

**Neerchedi** is a hydroponics monitoring and control system made of:

- A React + Vite web client
- Firebase Realtime Database as the shared control/data backbone
- An ESP32 firmware layer that connects Wi-Fi, NTP time sync, and Firebase
- An Arduino UNO firmware layer that drives the physical outputs

At a high level, the web application updates Firebase, the ESP32 reads and writes Firebase, and the ESP32 forwards runtime commands to the Arduino UNO over serial. The UNO then switches pumps/valves/actuators through GPIO.

## 2. High-Level Architecture

```text
User
  |
  v
React Web App (Vite)
  |
  v
Firebase Realtime Database
  |
  v
ESP32 Controller
  |- Reads control/config data from Firebase
  |- Writes telemetry/status back to Firebase
  |- Gets current IST time from NTP
  |- Sends runtime commands to UNO over Serial
  v
Arduino UNO
  |
  v
Pumps / Valves / Dosing outputs
```

## 3. Repository Structure

```text
/
|-- hardware/
|   |-- neerchedi/
|   |   `-- neerchedi.ino      # ESP32 firmware
|   `-- uno/
|       `-- uno.ino            # Arduino UNO firmware
|
|-- web/
|   `-- Client/
|       |-- src/
|       |   |-- components/
|       |   |-- context/
|       |   |-- pages/
|       |   `-- firebase.js
|       |-- package.json
|       `-- vite.config.js
|
|-- vite.config.js
`-- nixpacks.toml
```

## 4. Technology Stack

### Frontend

- React 18
- React Router DOM
- Vite
- Tailwind CSS
- React Draggable
- React Resizable
- Firebase JavaScript SDK

### Backend / Data Layer

- Firebase Realtime Database
- No custom backend server in this repository
- No Firestore, SQL DB, ORM, or REST API layer found in the codebase

### Hardware / Embedded

- ESP32
- Arduino UNO
- Wi-Fi
- NTP (`time.nist.gov`)
- FirebaseESP32 library
- Serial communication between ESP32 and UNO

### Build / Deployment

- Vite build system
- `nixpacks.toml` present, suggesting deployment packaging support

## 5. Runtime Components

### 5.1 Web Client

The web client is the operator-facing dashboard and control panel.

Main screens:

- `/` -> public home dashboard
- `/login` -> admin login
- `/admin` -> protected admin panel

Main functions:

- Display hydroponics telemetry
- Display ESP32 liveness using timestamp freshness
- Create/update/delete one automation profile
- Toggle automation on/off
- Perform manual control of pumps/valves
- Toggle UI theme

### 5.2 Firebase Realtime Database

Firebase acts as the central shared state store for:

- Admin credentials
- Hydroponics timing values
- Measured pH
- Device state
- Current and last update timestamps
- Automation settings
- Manual control commands
- Pump status flags

### 5.3 ESP32

The ESP32 firmware is the integration bridge between cloud data and local hardware.

Responsibilities:

- Connect to Wi-Fi
- Connect to Firebase
- Sync time from NTP
- Read automation/control values from Firebase
- Measure pH from analog sensor input
- Adjust acid/base dosing locally
- Write telemetry/status back to Firebase
- Forward automation/manual commands to UNO over serial

### 5.4 Arduino UNO

The UNO is the low-level actuator controller.

Responsibilities:

- Receive serial messages from ESP32
- Parse timing packet `T:...`
- Parse manual control packet `M:...`
- Turn GPIO outputs on/off
- Run dosing timing sequence when automation is activated

## 6. Frontend Module Analysis

### 6.1 Routing

Defined in `web/Client/src/App.jsx`.

Routes:

- `/` -> `Home`
- `/login` -> `Login`
- `/admin` -> `Admin` behind `ProtectedRoute`

Protection logic:

- Admin access is controlled only by `localStorage.isAdminLoggedIn`
- There is no JWT, Firebase Auth session, or server-side session validation

### 6.2 Authentication

Authentication is implemented in a custom way:

- Login page reads `/auth/adm/user` and `/auth/adm/pass` from Firebase
- Entered username/password are compared in the browser
- If matched, `localStorage.isAdminLoggedIn = true`

Important implication:

- This is not secure authentication
- Credentials are stored in Realtime Database and validated client-side
- Anyone with database read access to `/auth/adm/*` can potentially retrieve admin credentials

### 6.3 Home Page

The home page is a public read-only dashboard showing:

- Bloom time
- Greens time
- Nutes time
- pH
- Current hydroponics state
- Updating flag
- Current timestamp
- Last nutrient update timestamp
- ESP liveness derived from timestamp age

### 6.4 Admin Page

The admin page is a desktop-style control area with:

- Mini dashboard
- Theme toggle
- Automation window
- Settings/manual control window
- Logout action

UI behavior:

- Uses draggable windows
- Uses resizable windows
- Falls back to mobile-style stacked panels on very small screens

### 6.5 Dashboard Component

This component listens to:

- `hydroponics/`
- `hydroponics/time/nutrients/`

It calculates ESP liveness:

- If current local time and `currentEpoch` differ by more than 300 seconds, UI shows `ESP Not Alive`
- Otherwise shows `Online`

### 6.6 Automation Component

This is the automation profile manager.

Current behavior:

- Uses a single hardcoded automation record: `/automations/test`
- Supports add/edit/delete UI
- Stores:
  - name
  - bloomMl
  - greensMl
  - nutesMl
  - checkDuration

Operational logic:

- Converts ml values into milliseconds using `(ml / 10) * 1000`
- Writes derived values into `/hydroponics`
- Toggles `/hydroponics/state` between `on` and `off`

Design note:

- Although the UI looks list-based, the implementation only persists one automation object at `/automations/test`
- `checkDuration` is stored but not actually consumed by the ESP32 logic for scheduling intervals

### 6.7 Settings Component

Manual control UI for:

- greens
- nutes
- blooms
- inlet
- outlet

Also displays:

- greensPump
- nutesPump
- bloomsPump

Behavior:

- Writes the entire `controls` object back to Firebase on each toggle
- Also mirrors `controlNamePump` to match the UI toggle

## 7. Hardware / Firmware Analysis

## 7.1 ESP32 Firmware (`hardware/neerchedi/neerchedi.ino`)

### Core responsibilities

- Connects to Wi-Fi using secrets from `top_secret.h`
- Uses anonymous Firebase signup
- Reads and writes Firebase RTDB
- Uses NTP for IST time sync
- Reads pH sensor
- Controls acid/base correction outputs
- Sends serial control packets to UNO

### GPIO mapping on ESP32

- `phsensor` -> pin `2`
- `bloom` -> pin `4`
- `nutes` -> pin `5`
- `greens` -> pin `18`
- `acid` -> pin `19`
- `base` -> pin `21`
- `inlet` -> pin `13`
- `outlet` -> pin `12`

### Firebase reads on ESP32

- `/hydroponics/bloom_time`
- `/hydroponics/nutes_time`
- `/hydroponics/greens_time`
- `/hydroponics/time/nutrients/lastUpdatedEpoch`
- `/controls/greens`
- `/controls/nutes`
- `/controls/blooms`
- `/controls/inlet`
- `/controls/outlet`
- `/hydroponics/updating`

### Firebase writes on ESP32

- `/hydroponics/bloom_time`
- `/hydroponics/nutes_time`
- `/hydroponics/greens_time`
- `/hydroponics/ph`
- `/hydroponics/state`
- `/hydroponics/time/nutrients/lastUpdatedEpoch`
- `/hydroponics/time/nutrients/currentEpoch`
- `/controls/greensPump`
- `/controls/nutesPump`
- `/controls/bloomsPump`

### ESP32 local logic

#### pH management

- Reads analog sensor
- Converts raw reading to voltage
- Converts voltage to pH using `ph = 3.5 * volts + 0.5`
- If `ph > 6.5`, triggers acid pump briefly
- If `ph < 5.5`, triggers base pump briefly

#### Time and nutrient interval

- Time is fetched from NTP in IST offset
- `DateUpdater` tracks last nutrient update epoch
- Nutrient day difference is computed from epoch values

Important observation:

- `nutridaydiff` is hardcoded to `1`
- The web automation field `checkDuration` is not wired into the ESP32 interval logic

#### Serial messaging to UNO

ESP32 sends two message types:

1. Timing packet

```text
T:bloom_time,greens_time,nutes_time,ph,state,activate
```

2. Manual packet

```text
M:greens,nutes,blooms,inlet,outlet
```

After sending timing data, the ESP32 resets:

- `bloom_time = 0`
- `greens_time = 0`
- `nutes_time = 0`

That means the RTDB timing values are treated like transient command values rather than long-lived configuration.

## 7.2 Arduino UNO Firmware (`hardware/uno/uno.ino`)

### Core responsibilities

- Receives serial strings from ESP32
- Parses control/timing packets
- Drives output pins
- Runs dosing sequence if automation is activated

### GPIO mapping on UNO

- `bloom` -> pin `2`
- `nutes` -> pin `3`
- `greens` -> pin `4`
- `inlet` -> pin `5`
- `outlet` -> pin `10`
- `acid` -> pin `6`
- `base` -> pin `8`

### UNO behavior

- If packet starts with `M:`, update manual control booleans and set pins
- If packet starts with `T:`, parse times, pH, state, activate
- If `activate` is true and manual dosing controls are not active, run timed sequence

### Watchdog

- Watchdog timer is enabled with 2-second timeout
- `wdt_reset()` is called in loop

## 8. Connection Map

## 8.1 Web -> Firebase

The web app directly reads/writes Firebase Realtime Database through the JS SDK.

Configured by:

- `VITE_FBRTDBAPI`
- `VITE_FBRTDBURL`

No backend proxy exists in this repository.

## 8.2 ESP32 -> Wi-Fi -> Firebase

ESP32 uses:

- Wi-Fi credentials from `top_secret.h`
- Firebase API key and DB URL from `top_secret.h`

This means both browser and device are separate Firebase clients pointing to the same RTDB.

## 8.3 ESP32 -> NTP

ESP32 syncs time from:

- `time.nist.gov`

Configured timezone:

- GMT offset `19800` seconds
- Equivalent to IST (`UTC+5:30`)

## 8.4 ESP32 -> Arduino UNO

Communication type:

- Serial text protocol at `115200` baud

Message types:

- `T:` for automation/timing state
- `M:` for manual control state

## 9. Database Analysis

This project uses **Firebase Realtime Database**, so strictly speaking there are no SQL tables. The closest equivalent is RTDB top-level nodes and nested keys.

## 9.1 Top-Level Data Model

### `auth`

Used for admin login credentials.

Expected structure:

```json
{
  "auth": {
    "adm": {
      "user": "admin_username",
      "pass": "admin_password"
    }
  }
}
```

### `hydroponics`

Used for live hydroponics runtime values.

Observed structure:

```json
{
  "hydroponics": {
    "bloom_time": 0,
    "greens_time": 0,
    "nutes_time": 0,
    "ph": 0,
    "state": "on|off",
    "updating": true,
    "time": {
      "nutrients": {
        "lastUpdatedEpoch": 0,
        "currentEpoch": 0
      }
    }
  }
}
```

Meaning of fields:

- `bloom_time` -> dosing/pump duration in milliseconds
- `greens_time` -> dosing/pump duration in milliseconds
- `nutes_time` -> dosing/pump duration in milliseconds
- `ph` -> measured pH value
- `state` -> overall automation status
- `updating` -> UI/device synchronization flag
- `time/nutrients/lastUpdatedEpoch` -> last nutrient cycle timestamp
- `time/nutrients/currentEpoch` -> current ESP32 timestamp

### `automations`

Current implementation uses only one object:

```json
{
  "automations": {
    "test": {
      "name": "Profile Name",
      "bloomMl": 50,
      "greensMl": 50,
      "nutesMl": 50,
      "checkDuration": 10
    }
  }
}
```

Important note:

- This is not a scalable multi-record automation table
- The UI suggests multiple records, but code reads/writes one fixed node

### `controls`

Manual control and mirrored pump states.

Observed/expected structure:

```json
{
  "controls": {
    "greens": false,
    "nutes": false,
    "blooms": false,
    "inlet": false,
    "outlet": false,
    "greensPump": false,
    "nutesPump": false,
    "bloomsPump": false
  }
}
```

Meaning:

- `greens`, `nutes`, `blooms`, `inlet`, `outlet` -> requested UI/manual control states
- `greensPump`, `nutesPump`, `bloomsPump` -> mirrored/feedback states shown in UI

## 9.2 Database Paths Used by Module

### Login

- `/auth/adm/user`
- `/auth/adm/pass`

### Dashboard

- `hydroponics/`
- `hydroponics/time/nutrients/`

### Automation

- `/automations/test`
- `/hydroponics`

### Manual Settings

- `controls`

### ESP32 Firmware

- `/hydroponics/*`
- `/hydroponics/time/nutrients/*`
- `/controls/*`

## 10. Roles and Access Model

There are effectively two application roles.

### 10.1 Public User

Capabilities:

- Access home dashboard
- View hydroponics data
- View current device state and timestamps

Restrictions:

- Cannot access `/admin` unless local auth flag is set

### 10.2 Admin User

Capabilities:

- Log in via `/login`
- Access `/admin`
- Create/edit/delete automation profile
- Enable/disable automation
- Toggle manual controls
- Log out

Important security note:

- Role enforcement is client-side only
- Real security depends on Firebase Database Rules, which are not present in this repository

## 11. How the System Works End to End

## 11.1 Read-Only Monitoring Flow

1. User opens `/`
2. Dashboard subscribes to `hydroponics` and nutrient time nodes
3. Firebase pushes live values to browser
4. UI shows dosing times, pH, state, and ESP health

## 11.2 Admin Login Flow

1. User opens `/login`
2. Browser fetches username/password from Firebase
3. Browser compares submitted values locally
4. On match, browser sets `localStorage.isAdminLoggedIn = true`
5. User is routed to `/admin`

## 11.3 Automation Setup Flow

1. Admin creates or edits the automation profile
2. Profile is stored at `/automations/test`
3. UI converts ml values to milliseconds
4. UI updates `/hydroponics` with pump times and `updating` flags
5. Automation can be enabled by setting `/hydroponics/state = "on"`

## 11.4 Manual Control Flow

1. Admin toggles a manual control in Settings
2. Browser writes new values under `controls`
3. ESP32 reads `controls/*`
4. ESP32 sends `M:` serial packet to UNO
5. UNO updates the relevant physical output

## 11.5 Telemetry / Feedback Flow

1. ESP32 measures pH
2. ESP32 writes pH and timestamps to Firebase
3. Dashboard updates automatically in browser
4. UI infers whether ESP32 is online from the freshness of `currentEpoch`

## 11.6 Automation Execution Flow

1. ESP32 reads hydroponics timing values and state
2. ESP32 forwards `T:` packet to UNO
3. UNO parses timing and activation values
4. If activated and no manual dosing control is active, UNO runs bloom/nutes/greens sequence

## 12. Configuration and Secrets

## 12.1 Web Environment Variables

Used in `web/Client/src/firebase.js`:

- `VITE_FBRTDBAPI`
- `VITE_FBRTDBURL`

## 12.2 ESP32 Secret Header

`top_secret.h` is referenced but not committed.

It likely contains:

- Wi-Fi SSID
- Wi-Fi password
- Firebase API key
- Firebase Database URL

Expected values:

- `ssid`
- `password`
- `API_KEY`
- `DATABASE_URL`

## 13. Build and Run Notes

## 13.1 Web App

Inside `web/Client`:

```bash
npm install
npm run dev
```

Configured Vite ports:

- Dev server: `3000`
- Preview server: `3000`

## 13.2 Hardware

Separate Arduino sketches exist for:

- ESP32 board
- Arduino UNO board

They must be flashed independently.

## 14. Design Strengths

- Clear separation between UI, cloud sync, and actuator control
- Firebase RTDB gives simple live sync behavior
- Dashboard is easy to monitor in real time
- ESP32 acts as a practical bridge between internet and local microcontroller control
- Manual and automation modes are both represented

## 15. Risks, Gaps, and Observations

### Security concerns

- Admin credentials are stored in RTDB and validated client-side
- No proper authentication provider is used
- Route protection is based on `localStorage`
- Firebase Database Rules are not included, so actual data protection cannot be verified

### Data model concerns

- `automations/test` is hardcoded, so there is only one effective automation profile
- `checkDuration` is stored in the UI but not wired into firmware scheduling
- `hydroponics` is overwritten in several places, which can create race conditions
- Web and ESP32 both write to some of the same hydroponics fields

### Firmware / control concerns

- ESP32 resets timing values to zero after sending to UNO, so timing values are transient
- `activate` appears to remain false on the ESP32 path shown, which may prevent expected automated execution unless another part of the logic sets it later
- `outlet` is declared as `INPUT` on ESP32, which is unusual for a control solenoid and may be a bug depending on wiring intent
- Multiple sequential `Firebase.get*` and `Firebase.set*` calls may make the loop relatively chatty

### Frontend concerns

- `App.jsx` wraps `ThemeProvider` even though `main.jsx` already wraps `ThemeProvider`, so the provider is duplicated
- `AuthContext.login()` exists but `login.jsx` writes to `localStorage` directly instead of using the context API
- Some UI text/icon encoding appears garbled, suggesting character encoding issues in source files

## 16. Suggested Logical Data Dictionary

If you want to standardize the project further, the intended data responsibilities could be treated like this:

- `auth` -> application login metadata
- `hydroponics` -> live plant/system telemetry and active runtime state
- `automations` -> reusable automation recipes/profiles
- `controls` -> manual override commands and actuator feedback
- `deviceStatus` -> future area for Wi-Fi status, firmware version, heartbeat, errors
- `logs` -> future area for historical events and audit tracking

## 17. Summary

This project is a **full-stack IoT hydroponics control system** centered on Firebase Realtime Database.

Its current real-world architecture is:

- React frontend for monitoring and admin control
- Firebase RTDB as the shared live state layer
- ESP32 as the cloud-connected field controller
- Arduino UNO as the direct actuator controller

The project already has a workable end-to-end control loop, but the most important limitations are:

- insecure client-side authentication
- a single hardcoded automation profile
- partial mismatch between UI fields and firmware behavior
- shared-state race risks in Firebase writes

If needed, the next useful step after this analysis would be creating:

1. a Firebase schema document with recommended rules
2. a wiring/pinout diagram
3. a sequence diagram for automation and manual control
4. a hardening plan for auth and device communication
