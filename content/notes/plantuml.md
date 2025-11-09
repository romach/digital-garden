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

## Table inside note
```plantuml
@startuml
!pragma teoz true

component "User Service" as US

note right of US
|= Property |= Value |
| Port | 8080 |
| Version | 1.3.2 |
end note
@enduml
```
```
@startuml
!pragma teoz true

component "User Service" as US

note right of US
|= Property |= Value |
| Port | 8080 |
| Version | 1.3.2 |
end note
@enduml
```

## Custom block color

```plantuml
@startuml
skinparam component {
  BackgroundColor<<inprogress>> yellow
}
[First component] <<inprogress>>
@enduml
```
```
@startuml
skinparam component {
  BackgroundColor<<inprogress>> yellow
}
[First component] <<inprogress>>
@enduml
```

## Hide stereotype

```plantuml
@startuml
hide stereotype
[First component] <<inprogress>>
@enduml
```
```
@startuml
hide stereotype
[First component] <<inprogress>>
@enduml
```
