## ADDED Requirements

### Requirement: Official runtime discovery

Orkas SHALL expose Antigravity as an external agent and discover `agy` using existing CLI discovery or the explicit `ORKAS_ANTIGRAVITY_PATH` override.

#### Scenario: Runtime absent
- **WHEN** no Antigravity executable is installed
- **THEN** Antigravity is unavailable and no installation or purchase starts automatically.

#### Scenario: Runtime present
- **WHEN** the executable is discovered and reports a recognized version
- **THEN** the user can create an external Antigravity agent.

### Requirement: Native authentication and transport

Orkas SHALL run the official `agy acp` subprocess with inherited network environment and native cached authentication, without copying tokens or switching billing methods.

#### Scenario: Existing enterprise login
- **WHEN** the user runs an Antigravity agent with a native Enterprise login and configured proxy
- **THEN** Orkas uses that runtime environment and displays streamed replies and permission requests.

#### Scenario: Authentication missing
- **WHEN** ACP rejects a session with Authentication required
- **THEN** Orkas reports failure without using an API-key fallback.

### Requirement: Conservative capability declaration

Orkas SHALL use native runtime defaults and SHALL NOT advertise model selection, native resume or permission bypass in this initial adapter.

#### Scenario: Unsupported initialization
- **WHEN** the runtime rejects initialization or an incompatible protocol is reported
- **THEN** the run ends with an explicit failure before a prompt is sent.

#### Scenario: Permission request
- **WHEN** a native tool asks for permission
- **THEN** the existing approval flow handles it and missing approval denies the action.
