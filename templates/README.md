# Opal Templates

## Description

This folder contains the Opal templates that have been re-use throughout the app. The purpose of this folder is to generalize and formalize the development of Opal in a more concrete way. This means a more consistent development of Opal by use of consistent templates. In the future and ideally, this would mean not only creating and insertion of the templates in appropiate places but also automatic set up for other development tasks such as documenting and testing. Examples of comments [ngdocs](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation) style, automatic creation of a testing script for both the controller and the service created by the template using the correct [karma](https://karma-runner.github.io/1.0/index.html) workflow.

## How it works

Mitigating the use of ***Gulp*** as a task manager for Opal it's possible to create a workflow that will take care of appropiate copying of files, injection of code into html of project and automatic customization of views based on templates. 

_Under-the-hood_ there is a task called opal created in gulpfile.js this task takes care of the opal templates. To do this, it uses the the file under the templates folder called ***patterns.json***, this file so far contains the following information:
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

## Templates
Basic templates are added here, i.e. templates that are used commonly in the opal project.

Templates so far:
- module

## Future Work
1. Creation of the following templates:
    - [ ] Booklet
    - [ ] Setting style template
    - [ ] Document page/appointment detail/task details style template

2. Creating of test script functionality for each module created.
3. Addition of appropiate comments and building workflow for automatic documentation.

 