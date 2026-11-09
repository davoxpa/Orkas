## ADDED Requirements

### Requirement: Talia release discovery
Talia SHALL compare its current version with the latest published stable release of the Talia fork and show a visible update indicator when a newer version exists.

#### Scenario: Newer stable release
- **WHEN** the published release tag has a higher semantic version than the running app
- **THEN** the version button shows the newer version and opens the Talia release page when clicked.

#### Scenario: No release or network failure
- **WHEN** the release feed is absent or unavailable
- **THEN** the current app remains usable and the manual check reports that an update could not be confirmed.

### Requirement: Manual release check
Talia SHALL let the user check releases by clicking the current version in the sidebar, without automatically downloading or installing software.

#### Scenario: Current version
- **WHEN** the user clicks the version button and no newer stable release exists
- **THEN** Talia reports that the running version is current.
