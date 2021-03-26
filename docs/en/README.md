![GaifaaYeepun](https://user-images.githubusercontent.com/42882840/80269234-b4ad1c80-86e8-11ea-8a02-567b854170d5.png)

![deploy gaifaa](https://github.com/jocv-thai/pleethai/workflows/deploy%20gaifaa/badge.svg)

[日本語](../../README.md) | English | [ภาษาไทย](../th/README.md)

# Overview
GaifaaYeepun is a dictionary website project for Japanese, Thai, and English words/sentences, powered by Django.
This project is designed for Thai people who are learning Japanese, and also Japanese people who are learning Thai language.

# Prerequisites
## Server

* Web Server(Windows Server+IIS)(for Production Environment)
* Python(3.6.7 recommended)
* Git

## Client

* PC / Smartphone


# Install
- Production Environment (**To Be Determined**)
- [Development Environment](./install_develop.md)


# Usage (for system users)
On the "Search Page", you can search for words/sentences.

In case a word/sentence you looked up was not registered, you can send a request for the new
words/sentences to the system manager from the "Request Page".


## details of each page

- [Search Page](./howtouse_search.md)  
[<img src ="https://user-images.githubusercontent.com/42882840/101600410-96f5b300-3a3e-11eb-946c-67aa101f1ddb.gif" alt="search demo" width="320">](./howtouse_search.md)

- [Request Page](./howtouse_request.md)  
[<img src ="https://user-images.githubusercontent.com/42882840/101600726-0f5c7400-3a3f-11eb-8bad-3a91b21d8d55.png" alt="request demo" width="320">](./howtouse_request.md)

- [Quiz Page](./howtouse_quiz.md)  
[<img src ="https://user-images.githubusercontent.com/42882840/109138683-f93c9500-779d-11eb-82d2-f56818de73ee.gif" alt="quiz demo" width="320">](./howtouse_quiz.md)


# System Maintenance Procedure
- How to update system
  - Get the newest files from this repository, and restart the web server.
- [How to add or edit words/sentences](./maintenance_dataedit.md)
- [What to do when you receive a user’s request](./maintenance_reqreceived.md)


# System Configuration
- System Configuration Diagram  
![System Configuration Diagram](https://docs.google.com/drawings/d/e/2PACX-1vSLFh_yZhKKi0L7hnfksXXx2Rjc6bimx0RjocQRpwrI5KxMZSzmARUx9lNiZXjq-8R6oSboAkMqkxgV/pub?w=2024&h=996)

- [Database Structure](./database.md)
