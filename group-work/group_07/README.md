# Group 07

- Dinis Miranda
- Francisco Carvalho
- Henrique Reis

With this project, we aim to build a system capable of analyzing data from sensors implemented within an IoT architecture, collecting and processing information regarding movement.

Specifically, we want to analyze data gathered from devices equipped with inertial sensors to understand how a user moves over time. The application utilizes a MongoDB database to store motion records containing values for acceleration, rotation rate, gravity, and spatial orientation.

Regarding spatial orientation, the pitch, roll, and yaw values allow us to understand the device's orientation and its tilt in space. By using queries and aggregation pipelines, we can hierarchize the data stored in the database to perform more complex analyses. This includes identifying movement patterns, sudden activity spikes, periods of immobility, and calculating useful statistics such as means, maximums, minimums, and percentiles.

Such a system is valuable in practical scenarios, such as activity tracking or behavior analysis for wearables and other IoT applications. This project demonstrates MongoDB's potential for managing large volumes of unstructured data and serves as a foundation for effective data analysis.    