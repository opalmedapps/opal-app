/**
 *  * Created by David Herrera on 2017-07-12.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
//Module API
if(process.argv[2]==='--run')
{
	collectData();
}
module.exports =
{
	collectData: collectData,
	totalCpuTimeTicks:totalCpuTimeTicks,
	computeMeanCpu:computeMeanCpu,
	collectDataArray:collectDataArray,
	chainDataCollection:chainDataCollection,
	Cpu:cpuClass
};


function chainDataCollection(arr,iterations)
{
	return new Promise((resolve,reject)=>
	{
		collectPoint().then((point)=>{
			arr.push(point);
			console.log(arr);
			return (iterations>arr.length)?chainDataCollection(arr,iterations):new Promise((resolve,reject)=>resolve(arr));
		}).catch((error)=>console.log(error));
	});
}

function collectData()
{
	let current = totalCpuTimeTicks();
	let prev = null;
	setInterval(()=>{
		if(prev!==null) fs.appendFileSync(path.join(__dirname,process.argv[3]),computeMeanCpu(current, prev)+",");
		prev = current;
		current = totalCpuTimeTicks();
	},300);
}
function collectDataArray(arr)
{
	let current = totalCpuTimeTicks();
	let prev = null;
	let iter = setInterval(()=>{

		if(prev!==null)arr.push(computeMeanCpu(current, prev));
		if(prev!==null)console.log(computeMeanCpu(current, prev));
		prev = current;
		current = totalCpuTimeTicks();
	},100);
	return iter;
}
function collectPoint()
{
	return new Promise((resolve,reject)=>{
		let current = totalCpuTimeTicks();
		setTimeout(()=>resolve(computeMeanCpu(current, totalCpuTimeTicks())),100);
	});
}


function totalCpuTimeTicks() {

	//Initialise sum of idle and time of cores and fetch CPU info
	var totalIdle = 0, totalTick = 0;
	var cpus = os.cpus();

	//Loop through CPU cores
	for(var i = 0, len = cpus.length; i < len; i++) {

		//Select CPU core
		var cpu = cpus[i];

		//Total up the time in the cores tick
		for(type in cpu.times) {
			totalTick += cpu.times[type];
		}

		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
	}

	//Return the average Idle and Tick times
	return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

function computeMeanCpu(start,end)
{
	//Calculate the difference in idle and total time between the measures
	let idleDifference = end.idle - start.idle;
	let totalDifference = end.total - start.total;
	//Calculate the average percentage CPU usage
	let percentageCPU = 100 - (100 * idleDifference / totalDifference);
	return Number(percentageCPU.toFixed(2));

}


var cpuClass = class CpuTimings
{
	static collectData()
	{
		var total = [];
		let current = totalCpuTimeTicks();
		let prev = null;
		setInterval(()=>{
			if(prev!=null)
			{
				total.push(computeMeanCpu(current,prev));
			}

			prev = current;
			current = totalCpuTimeTicks();

		},200);
	}
	// constructor()
	// {
	//     this.total = [];
	//     collectData();
	// }

	static totalCpuTimeTicks()
	{
		//Initialise sum of idle and time of cores and fetch CPU info
		var totalIdle = 0, totalTick = 0;
		var cpus = os.cpus();

		//Loop through CPU cores
		for(var i = 0, len = cpus.length; i < len; i++) {

			//Select CPU core
			var cpu = cpus[i];

			//Total up the time in the cores tick
			for(type in cpu.times) {
				totalTick += cpu.times[type];
			}

			//Total up the idle time of the core
			totalIdle += cpu.times.idle;
		}

		//Return the average Idle and Tick times
		return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
	}
	static computeMeanCpu(start,end) {
		//Calculate the difference in idle and total time between the measures
		var idleDifference = end.idle - start.idle;
		var totalDifference = end.total - start.total;
		//Calculate the average percentage CPU usage
		var percentageCPU = 100 - (100 * idleDifference / totalDifference);
		return Number(percentageCPU.toFixed(2));
	}

}