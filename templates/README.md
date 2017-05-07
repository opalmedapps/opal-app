# Opal Templates

## Description

This folder contains the Opal templates that have been re-use throughout the app. The purpose of this folder is to generalize and formalize the development of Opal in a more concrete way. This means a more consistent development of Opal by use of consistent templates. In the future and ideally, this would mean not only creating and insertion of the templates in appropiate places but also automatic set up for other development tasks such as documenting and testing. Examples of comments [ngdocs](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation) style, automatic creation of a testing script for both the controller and the service created by the template using the correct [karma](https://karma-runner.github.io/1.0/index.html) workflow.

## How it works
Mitigating the use of ***Gulp*** as a task manager for Opal it's possible to create a workflow that will take care of appropiate copying of files, injection of code into the project's html and automatic customization of views based on templates. 


_Under-the-hood_ there is a task called opal created in gulpfile.js this task takes care of the opal templates. To do this, it uses the file under the templates folder called ***patterns.json***, this file so far contains the following information:
```
{
    "module":
    {
      "includeService":true,
      "includeController":true,
      "includeView":true,
      "addTab":true
    }
}
```
Here _module_ stands for the name of the template to be use, in this case, _module_ creates an opal module, this module  in opal is created and added to the appropiate folders and pages in the application.
(An example would be the appointments module where a service, controller, main view, and a tab are created to handle the appointments functionality)

How to run:
```
$gulp opal --template module ...
```
Here the ... stands for the options for that templates.
## Templates
Basic templates are added here, i.e. templates that are used commonly in the opal project.

Templates so far:
1. #### module:
How to run:
```
$gulp opal --template module --name <module-name> --view personal 
```
What it does:
1. Creates of moduleName Controller, moduleName Service, moduleName Html view by using template.
2. Replaces template-names in the templates by the moduleName
3. Saves files in appropiate directories, i.e. www/js/controllers, www/js/services, www/views/personal
4. Injects into index.html controller and service paths
5. Injects into personal.html a tab at the end of the personal tab list


## Future Work
1. Claritication and formalization of the CLI.
2. Creation of the following templates:
    - [ ] Booklet Page
    - [ ] Page a list with dates in the right format
    - [ ] _Settings-style_
    - [ ] Graphing Plot template such as the one provided for lab results
    - [ ] Document-detail-page/appointment-detail/treatment-planing-details style template

3. Creating of test script functionality for each module.
4. Addition of appropiate comments and building workflow and setting up automatic documentation.

