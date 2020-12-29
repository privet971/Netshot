/*
 * Copyright 2013-2019 Sylvain Cadilhac (NetFishers)
 * 
 * This file is part of Netshot.
 * 
 *
 *
 *
 * Netshot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Netshot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Netshot.  If not, see <http://www.gnu.org/licenses/>.
 */

var Info = {
	name: "Firepower",
	description: "Cisco FX-OS",
	author: "Philippe Rivet",
	version: "1.1"
};

var Config = {
	"osVersion": {
		type: "Text",
		title: "FXos version",
		comparable: true,
		searchable: true,
		dump: {
			pre: "!! FXos version:",
			preLine: "!!  "
		}
	},
	"configuration": {
		type: "LongText",
		title: "Configuration",
		comparable: true,
		searchable: true,
		checkable: true,
		dump: {
			pre: "!! Configuration (taken on %when%):",
			post: "!! End of configuration"
		}
	}	
};

var Device = {
	"hardwareVersion": {
		type: "Text",
		title: "Hardware version",
		searchable: true
	},
	"hardwareType": {
		type: "Text",
		title: "Hardware type",
		searchable: true
	}
};
	
var CLI = {
	telnet: {
		fail: "Telnet access is not supported."
	},
	ssh: {
		macros: {
			basic: {
				options: [ "basic" ],
				target: "basic"
			}
		}
	},
	username: {
		macros: {
			auto: {
				cmd: "$$NetshotUsername$$",
				options: [ "password" ]
			}
		}
	},
	password: {
		prompt: /^Password: $/,
		macros: {
			auto: {
				cmd: "$$NetshotPassword$$",
				options: [ "basic" ]
			}
		}
	},
	basic: { /* The basic FxOS prompt. */
		prompt: /.*# /,
		error: /^% Invalid Command.*/m,
		pager: { /* 'pager': define how to handle the pager for long outputs. */
			avoid: [ "term length 0" ],
			match: /^--More--/,
			response: " "
		},
		macros: {
		end: {
				cmd: "exit"
			}	
			
		}

	}	
	
};


// 3 parameters max !!!!
function snapshot(cli, device, config) {
	
	cli.macro("basic");
	
	
	var runningConfig = cli.command("show configuration");
  


	config.set("configuration", runningConfig);
	
	
	
	var showInventory = "not supported";
    	var showInstall = "not supported";
	
	
	device.set("networkClass", "FIREWALL");
	device.set("family", "Firepower");
	
	var version = runningConfig.match(/.*system-version (.*)$/m);
	if (version) {
		version = version[1];
	}
	else {
		version = "Unknown";
	}
	
	config.set("osVersion", version);
	device.set("softwareVersion",version);
		
	
	var hostname = runningConfig.match(/.*set name ([a-zA-Z].+)$/m);
	if (hostname != null) {
		device.set("name", hostname[1]);
	}
	else {
		device.set("name", "Unknown" );
	}
	
	var SNumber = cli.command("show chassis inventory");
	var SerNumber = SNumber.match(/.*Inc (.+) .*$/m);
	if (SerNumber) {
		device.set("serialNumber",SerNumber[1]);
		}
	else {
		device.set("serialNumber","Unknowm");
		}

	var locat = runningConfig.match(/.*set snmp syslocation ([a-zA-Z].+)$/m);
	if (locat != null) {
		device.set("location", locat[1]);
		}

	var cont = runningConfig.match(/.*set snmp syscontact ([a-zA-Z].+)$/m);
	if (cont != null) {
		device.set("contact", cont[1]);
		}

	var hardVersion = cli.command("show version");
	hardVersion = hardVersion.match(/Version: ([0-9]+.*)/);
	if (hardVersion) {
		device.set("hardwareVersion",hardVersion[1]);
		}
	else { device.set("hardwareVersion", "");	
		}

	var hardType =  cli.command("show chassis inventory");
        hardType = hardType.match(/(FPR-.*) Cisco.*/m);
	if (hardType) {
                device.set("hardwareType",hardType[1]);
                }

};


function runCommands(command) {

}

function analyzeSyslog(message) {
	return false;
}

function analyzeTrap(trap, debug) {
	return false;
}

function snmpAutoDiscover(sysObjectID, sysDesc, debug) {
	if (sysObjectID.match(/^1\.3\.6\.1\.4\.1\.9\.1\.277[2-9]$/) && sysDesc.match(/FX-OS/)) {
		return true;
		}
	return false;
}
