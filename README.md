#TeXpose API Server

The TeXpose API Server is the server behind the TeXpose LaTeX service.
It handles the users, stores the files and interacts with the DLBS.


##Contribution

###Get the source code

	git clone https://notyourrepo.org/repo.git

###Set up your development environment

Dependencies:
 * Vagrant
 * Virtualbox

Fire up the Vagrant virtual machine:

```bash
vagrant up
vagrant ssh

cd /vagrant
npm install
```
