# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "precise64"
  config.vm.box_url = " http://files.vagrantup.com/precise64.box"
  config.vm.provision "shell", path: "bootstrap.sh"
  config.vm.network :forwarded_port, host: 5353, guest: 3000
  config.vm.provider "virtualbox" do |v|
  	v.memory = 2048
	end
end