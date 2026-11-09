## ADDED Requirements

### Requirement: Device-local configuration

Orkas SHALL provide automatic, direct and manual proxy settings stored only on the computer, with distinct HTTP/HTTPS URLs and NO_PROXY exclusions.

#### Scenario: Persisting a manual proxy
- **WHEN** the user saves valid manual values
- **THEN** they survive reopening Orkas, are not synchronized and apply after restart.

#### Scenario: Invalid values
- **WHEN** a proxy URL or exclusion list is invalid
- **THEN** saving fails with a sanitized error and the previous configuration remains intact.

### Requirement: Consistent startup policy

Orkas SHALL apply saved settings before network initialization and external-agent spawning, preserve local bypasses and avoid changing running tasks during save.

#### Scenario: Direct mode
- **WHEN** Orkas starts in direct mode
- **THEN** inherited proxy variables are removed and automatic proxy routing is disabled for app-owned network stacks.

#### Scenario: Manual mode
- **WHEN** Orkas starts with valid manual settings
- **THEN** Node dispatchers, app-owned browser sessions and external CLI environments use the configured policy.

### Requirement: Isolated diagnostics

Orkas SHALL allow the owned main window to test an unsaved configuration against fixed service endpoints without credentials, model requests, persistence or mutation of active networking.

#### Scenario: Service requires authentication
- **WHEN** a test receives HTTP 401 or 403
- **THEN** the UI distinguishes service authentication or access denial from network reachability and does not claim account validation.

#### Scenario: Proxy failure
- **WHEN** the proxy refuses a connection, requires authentication or the test times out
- **THEN** a sanitized diagnostic is shown without exposing secrets or falling back to direct routing.

#### Scenario: Untrusted sender
- **WHEN** an unowned renderer invokes network settings or diagnostics
- **THEN** it is rejected before any storage or network operation.
