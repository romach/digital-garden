---
title: Java Diagram
tags:
  - java
---

```plantuml
@startuml
left to right direction
skinparam componentStyle rectangle

[JShell]

component "JDK" {
    component "JRE" {
        component "JVM"
    }
}

[Variable]

[Data Types]
[Data Types] ..> [Primitive]


@enduml
```
