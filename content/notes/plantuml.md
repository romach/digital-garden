---
title: PlantUML
---

## Default diagram

```plantuml
@startuml
[First component] ..> [Another component]
@enduml
```
```
@startuml
[First component] ..> [Another component]
@enduml
```

## Custom block style

```plantuml
@startuml
skinparam componentStyle rectangle
[First component]
@enduml
```
```
@startuml
skinparam componentStyle rectangle
[First component]
@enduml
```

## Note

```plantuml
@startuml
[First component]
note right of [First component]: A right note
@enduml
```
```
@startuml
[First component]
note right of [First component]: A right note
@enduml
```
## Custom block order

```plantuml
@startuml
left to right direction
[First component] ..> [Another component]
@enduml
```
```
@startuml
left to right direction
[First component] ..> [Another component]
@enduml
```
