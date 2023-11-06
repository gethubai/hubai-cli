# HubAI CLI

This is the CLI used for publishing and developing extensions and brains for HubAI platform. 

# Documentation
For the full documentation, please access: [CLI Documentation](https://www.hubai.app/docs/category/cli)

# Getting Started

## Installation

We recommend installing the CLI globally, so you can use it in any project.

```shell
npm install -g @hubai/cli
```

After the installation is complete, you can test the CLI by running:

```shell
hubai --help
```

If you have any errors, please check the [Troubleshooting](#troubleshooting) section or fill an issue.


## Authentication
If you want to publish packages to Hubai, you need to authenticate first.

Login or create a new account by running:

```shell
hubai auth login
```

Follow the instructions and after the authentication is complete, you can check your credentials by running:

```shell
hubai auth status
```

## Troubleshooting

Some **Windows** users might get the following error when executing the CLI for the first time:

```shell
 \hubai.ps1 cannot be loaded because running scripts is disabled on
this system. For more information, see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1
```

To fix it, open a powershell window as admin, and then executing the following:

```shell
Set-ExecutionPolicy RemoteSigned
```


