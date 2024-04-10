# Account Hierarchy Component 

## App Details: 

The "Account Hierarchy Component" is a Salesforce Lightning Web Component (LWC) designed to visualize and manage hierarchical relationships within account data. It allows users to view parent-child relationships, perform inline editing, and execute bulk operations such as deleting multiple accounts at once. 

- Component Name: Account Hierarchy Component 
- Type: Lightning Web Component (LWC) 
- Version: 1.0(Initial Release)

## Available for: 

1. Lightning App Page 
2. Lightning Record Page 
3. Lightning Home Page

## Features: 

- Display hierarchical relationships of child accounts within Salesforce. 
- View account details such as name, phone, industry, and type. 
- Ability to edit account details inline within the data table. 
= Row actions for viewing, editing, and deleting individual account records. 
- Select and delete multiple account records simultaneously. 
- Select and remove multiple account records from their parent hierarchy. 
- Dynamic rendering: Display a message when no child records are found. 
- Cacheable data retrieval for improved performance. 
- Integration with Apex controller for data manipulation and business logic.

## Screenshot:

![image](https://github.com/vetriCR/AccountHierarchy/assets/166398503/839b7a78-446a-4a29-897c-f12a7a623278)


## Deployment: 

- The component can be deployed as a Lightning Component Bundle in any Salesforce environment using the provided metadata and code. 
- Ensure appropriate sharing settings and access controls are configured for the component and associated Apex controller. 
- After deployment, add the component to Lightning App Pages, Record Pages, and Home Pages through the Lightning App Builder or by editing page layouts.
