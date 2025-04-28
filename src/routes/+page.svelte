<script>
	import { Button, Modal, Spinner } from 'flowbite-svelte';

	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import {
		myTask,
		kirimMsg,
		flowAPersen,
		flowBPersen,
		flowCPersen,
		taskMode,
		bleConnectionToggle,
		bleIsConnected,
		mqttConnectionToggle,
		mqttIsConnected,
		networkMode,
		networkSelect,
		getLocalStatus,
		kontrolID,
		networkSetup,
		sensorType,
		msgType,
		spinnerShow,
		modalMode,
		isStarted
	} from '$lib/stores';

	let defaultModal = false;
	let myTaskNow = null;

	let batasBawahValue = 30;
	let batasAtasValue = 32;
	let minSpinner = 10;
	let maxSpinner = 100;
	let volume = 80;

	let aktuator1Select = 0;
	let aktuator2Select = 0;
	let aktuatorMixASelect = 0;
	let aktuatorMixBSelect = 0;
	let aktuatorMixCSelect = 0;
	let aktuatorAdukSelect = 0;
	let aktuatorMixOutSelect = 0;
	let targetAValue = 0;
	let targetBValue = 0;
	let targetCValue = 0;

	let sensorSelect = 0;
	let sensorList = ['sensor1', 'sensor2'];
	let setupTitle = 'Setup';
	let sensorUseType = sensorType.TEMPERATURE;
	// @ts-ignore
	let lastMsg = null;

	// @ts-ignore
	let header = 'Temperature';
	const myKontrolID = get(kontrolID);
	let inputID = myKontrolID;

	// Gunakan onMount agar manipulasi DOM hanya terjadi di client-side
	onMount(() => {
		// Inisialisasi MQTT hanya jika belum ada koneksi
		/*
		mqttClient.subscribe((client) => {
			if (!client) {
				initMqtt(); // Koneksi pertama kali
			}
		});
		const unsubscribe = mqttData.subscribe((data) => {
			cekMqttMsg(data); // Panggil fungsi untuk memperbarui sensorData
		});
		openFullscreen();

		// Unsubscribe ketika komponen dibongkar
		return () => {
			unsubscribe();
		};
		*/
		//untuk internal litleFS
		//$networkMode = networkSelect.MODE_LOCAL

		$flowAPersen = 0;
		$flowBPersen = 0;
		$flowCPersen = 0;
		//
		//setTimeout(getTask, 1000);
		//setTimeout(openFullscreen, 3000);
		if ($networkMode === networkSelect.MODE_LOCAL) {
			setTimeout(getNetwork, 1000);
			setInterval(getLocalStatus, 2000);
		}
	});

	// @ts-ignore
	const aktuatorList = ['Aktuator1', 'Aktuator2', 'Aktuator3', 'Aktuator4'];

	const sensorLengasList = ['Sensor Lengas1', 'Sensor Lengas2'];

	const sensorTemperatureList = ['Sensor Temperature1', 'Sensor Temperature2'];
	const sensorHumidityList = ['Sensor Humidity1', 'Sensor Humidity2'];

	const sensorIntermittentList = ['Sensor Intermittent1', 'Sensor Intermittent2'];
	const serverList = ['server1', 'server2', 'server3'];

	const modeList = [
		'Mode Temperature',
		'Mode Humidity',
		'Mode Lengas',
		'Mode intermittent',
		'Mode Mix'
	];

	let setupIndex = 0;
	let setupMode = $modalMode.SET_TASK; //0 mode set task,1 mode set device,3 mode alert
	function openFullscreen() {
		const element = document.documentElement;
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}

	function getTask() {
		kirimMsg(msgType.KONTROL, 0, 'getAllTask', '1');
	}

	function getNetwork() {
		kirimMsg(msgType.KONTROL, 0, 'getNetwork', '1');
	}
	// @ts-ignore
	function enableClick(idx) {
		const lastEnableStatus = $myTask[idx].enable;
		if ($myTask[idx].enable == 0) {
			$myTask[idx].enable = 1;
		} else {
			$myTask[idx].enable = 0;
		}
		$spinnerShow[idx] = true;
		setTimeout(() => ($spinnerShow[idx] = false), 3000);

		if (!kirimMsg(msgType.TASK, idx, 'enable', String($myTask[idx].enable))) {
			$myTask[idx].enable = lastEnableStatus;
		}
	}

	// @ts-ignore
	export function setupClick(idx, mode) {
		defaultModal = true;
		setupIndex = idx;
		setupMode = mode;
		if (mode === $modalMode.SET_TASK) {
			setupTitle = 'Setup Auto' + $myTask[idx].nama;
			modeSelect = $myTask[idx].mode;
			namaSelect = $myTask[idx].nama;
			sensorSelect = $myTask[idx].nodeSensor - 1;

			//alert($myTask[idx].nama)
			//set pilih aktuator sesai data
			aktuator1Select = $myTask[idx].aktuator1 - 1;
			aktuator2Select = $myTask[idx].aktuator2 - 1;

			targetAValue = $myTask[idx].targetMixA * 100;
			targetBValue = $myTask[idx].targetMixB * 100;
			targetCValue = $myTask[idx].targetMixC * 100;

			// sensorList = sensorTemperatureList
			if ($myTask[idx].mode === taskMode.MODE_TEMPERATURE) {
				sensorList = sensorTemperatureList;
				batasBawahValue = $myTask[idx].batasBawah;
				batasAtasValue = $myTask[idx].batasAtas;
				minSpinner = 10;
				maxSpinner = 100;
			} else if ($myTask[idx].mode === taskMode.MODE_HUMIDITY) {
				sensorList = sensorHumidityList;
				batasBawahValue = $myTask[idx].batasBawah;
				batasAtasValue = $myTask[idx].batasAtas;
				minSpinner = 10;
				maxSpinner = 100;
			} else if ($myTask[idx].mode === taskMode.MODE_LENGAS) {
				sensorList = sensorLengasList;
				batasBawahValue = $myTask[idx].batasBawah;
				batasAtasValue = $myTask[idx].batasAtas;
				minSpinner = 10;
				maxSpinner = 100;
			} else if ($myTask[idx].mode === taskMode.MODE_INTERMITTEN) {
				sensorList = sensorIntermittentList;
				batasBawahValue = $myTask[idx].batasBawah - 15;
				batasAtasValue = $myTask[idx].batasAtas - 15;
				minSpinner = -15;
				maxSpinner = 15;
			}
		} else if (mode === $modalMode.SET_DEVICE) {
			//mode setup device
			setupTitle = 'Setup ' + $kontrolID;
		}
	}

	function aktuatorSelect_click(num = 1) {
		const tp = 'auto' + $myTask[setupIndex].nama;

		if (num == 1) {
			$myTask[setupIndex].aktuator1 = aktuator1Select + 1;
			//alert("pilih aktuator1 " + (aktuator1Select + 1));
		} else if (num == 2) {
			$myTask[setupIndex].aktuator2 = aktuator2Select + 1;
			//alert("pilih aktuator2 " + (aktuator2Select + 1));
		}
	}
	function sensorSelect_click() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		$myTask[setupIndex].nodeSensor = sensorSelect + 1;

		//alert("sensor temperture select: " + sensorSelect + 1);
	}
	let modeSelect = 0;
	let namaSelect = '';

	function modeSelect_click() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		$myTask[setupIndex].mode = modeSelect;

		// sensorList = sensorTemperatureList
		if (modeSelect === taskMode.MODE_TEMPERATURE) {
			sensorList = sensorTemperatureList;
			batasBawahValue = $myTask[setupIndex].batasBawah;
			batasAtasValue = $myTask[setupIndex].batasAtas;
			sensorUseType = sensorType.NODE_TEMPERATURE;
			minSpinner = 10;
			maxSpinner = 100;
			namaSelect = 'Temperature';
		} else if (modeSelect === taskMode.MODE_HUMIDITY) {
			sensorList = sensorHumidityList;
			batasBawahValue = $myTask[setupIndex].batasBawah;
			batasAtasValue = $myTask[setupIndex].batasAtas;
			sensorUseType = sensorType.NODE_HUMIDITY;
			minSpinner = 10;
			maxSpinner = 100;
			namaSelect = 'Humidity';
		} else if (modeSelect === taskMode.MODE_LENGAS) {
			sensorList = sensorLengasList;
			batasBawahValue = $myTask[setupIndex].batasBawah;
			batasAtasValue = $myTask[setupIndex].batasAtas;
			sensorUseType = sensorType.NODE_SOIL_MOISTURE;
			minSpinner = 10;
			maxSpinner = 100;
			namaSelect = 'Lengas';
		} else if (modeSelect === taskMode.MODE_INTERMITTEN) {
			sensorList = sensorIntermittentList;
			batasBawahValue = $myTask[setupIndex].batasBawah - 15;
			batasAtasValue = $myTask[setupIndex].batasAtas - 15;
			sensorUseType = sensorType.NODE_DISTANCE;
			minSpinner = -15;
			maxSpinner = 15;
			namaSelect = 'Intermittent';
		}
		setupTitle = 'Setup Auto' + namaSelect;

		//console.log("Mode select: " + modeList[modeSelect])
	}

	let serverSelect = 0;

	function serverSelectChange() {
		console.log('Server select: ' + serverList[serverSelect]);
	}

	function batasBawahChange() {
		const tp = 'auto' + $myTask[setupIndex].nama;
		/*
		if ($myTask[setupIndex].mode === taskMode.MODE_INTERMITTEN) {
			$myTask[setupIndex].batasBawah = batasBawahValue + 15;
		} else {
			$myTask[setupIndex].batasBawah = batasBawahValue;
		}
			*/
		$myTask[setupIndex].batasBawah = batasBawahValue;

		//alert("Target bawah: " + batasBawahValue);
	}

	function batasAtasChange() {
		const tp = 'auto' + $myTask[setupIndex].nama;
		/*
		if ($myTask[setupIndex].mode === taskMode.MODE_INTERMITTEN) {
			$myTask[setupIndex].batasAtas = batasAtasValue + 15;
		} else {
			$myTask[setupIndex].batasAtas = batasAtasValue;
		}
			*/
		$myTask[setupIndex].batasAtas = batasAtasValue;

		//alert("Target atas: " + batasAtasValue);
	}

	function mapClamp(x) {
		const in_min = -15;
		const in_max = 15;
		const out_min = 100;
		const out_max = 0;
		// Clamp input
		if (x < in_min) x = in_min;
		if (x > in_max) x = in_max;

		// Mapping
		return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	}

	function targetAValue_change() {
		const tp = 'auto' + $myTask[setupIndex].nama;
		$myTask[setupIndex].targetMixA = targetAValue / 100;
		//alert(
		//	"Target " +
		//		$myTask[setupIndex].mixANama +
		//		":" +
		//		targetAValue +
		//		"mL",
		//);
	}

	function targetBValue_change() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		$myTask[setupIndex].targetMixB = targetBValue / 100;
		/*
		alert(
			"Target " +
				$myTask[setupIndex].mixBNama +
				":" +
				targetBValue +
				"mL",
		);
		**/
	}

	function targetCValue_change() {
		const tp = 'auto' + $myTask[setupIndex].nama;

		$myTask[setupIndex].targetMixC = targetCValue / 100;

		/*alert(
			"Target " +
				$myTask[setupIndex].mixCNama +
				":" +
				targetCValue +
				"mL",
		);*/
	}

	function mixAClick() {
		//alert("nama MixA click");
	}

	function simpanTask() {
		if (setupMode === 0) {
			$myTask[setupIndex].nama = namaSelect;
			$myTask[setupIndex].mode = modeSelect;
			$myTask[setupIndex].sensorType = sensorUseType;
			kirimMsg(msgType.TASK, setupIndex, 'updateTask', JSON.stringify($myTask[setupIndex]));
			console.log('Update Task: ' + JSON.stringify($myTask[setupIndex]));
		} else {
			//simpan
			if ($networkMode === networkSelect.MODE_LOCAL) {
				kirimMsg(msgType.KONTROL, 0, 'updateServer', JSON.stringify($networkSetup));
			} else {
				//simpan kontrol id
				kontrolID.set(inputID);
			}
		}
	}

	let onlineCheck = false;

	function networkChange() {
		console.log('online check ' + onlineCheck);
		if (onlineCheck) {
			$networkSetup.mode = false;
		} else {
			$networkSetup.mode = true;
		}
	}

	//update myTask
	// $: myTask = myTask
</script>

<svelte:head>
	<title>KarjoAgro</title>
	<meta name="description" content="karjoAgro kontrol" />
</svelte:head>

{#if !$isStarted}
	<div class="grid grid-cols-3">
		<div></div>
		<Button color="light" class="mt-24 h-20 w-full" on:click={() => mqttConnectionToggle()}>
			Sambung ke jaringan
		</Button>
		<div></div>
		<div></div>
		<Button color="blue" class="mt-8 h-20 w-full" on:click={() => bleConnectionToggle()}>
			Sambung ke Local
		</Button>
		<div></div>
		<div></div>
		<Button class="mt-8 h-20 w-full" on:click={() => setupClick(1, $modalMode.SET_DEVICE)}>
			Setup
		</Button>
	</div>
{:else}
	<section>
		<!--Header-->
		<div class="text-center text-sm">karjoAgro</div>
		<div class="text-center font-mono text-4xl font-bold text-white">Agro Kontrol</div>
		<div class="mb-8 text-center text-xs text-white">{$networkMode} {$kontrolID}</div>
		<div class="no-select grid w-full grid-cols-2 gap-8">
			{#each $myTask as dataShow, idx}
				<div class="h-42 w-full rounded-lg bg-white p-0 shadow">
					<button
						class={dataShow.enable == 0
							? 'font-monospace mt-0 h-8 w-full  bg-red-500 text-center text-sm font-bold text-white '
							: 'font-monospace mt-0 h-8 w-full  bg-green-500 text-center text-sm font-bold text-white '}
						on:click={() => enableClick(idx)}
					>
						{#if $spinnerShow[idx]}
							<Spinner class="me-3" bg="white" size="5" color="yellow" />
						{/if}

						Auto{dataShow.nama}
					</button>

					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="h-24 w-full justify-items-center"
						on:dblclick={() => setupClick(idx, $modalMode.SET_TASK)}
					>
						{#if dataShow.mode === taskMode.MODE_INTERMITTEN}
							<div class="mt-2 grid h-24 w-full grid-cols-3 place-items-center gap-2">
								<div class="flex h-3/4 w-full justify-center">
									<div class="h-full w-6 rounded-full bg-indigo-700">
										<div
											class="w-6 rounded-full rounded-b-none bg-gray-200"
											style="height: {mapClamp(dataShow.sensorVal)}%;"
										></div>
									</div>
								</div>

								<div class="col-span-2">
									<div class=" w-full content-center text-center font-mono text-2xl font-bold">
										{dataShow.sensorVal}<small><small> cm</small></small>
									</div>
									<div style="font-size: x-small;text-align:center">
										ON:{dataShow.batasBawah} ~ OFF:{dataShow.batasAtas}
									</div>
									<div style="font-size:xx-small;" class="text-center">lastUpdate</div>
								</div>
							</div>
						{:else if dataShow.mode === taskMode.MODE_MIX}
							<div class="flex h-full w-full justify-center">
								<div class="mt-2 h-full w-5/6">
									<!-- Mix A-->
									<div class="mb-2 grid grid-cols-6">
										<div class="col-span-2 text-left text-xs font-bold">
											{dataShow.mixAnama}
										</div>
										<div class="col-span-3 h-4 rounded-full bg-gray-200">
											<div
												class="h-4 rounded-full bg-blue-600"
												style="width: {$flowAPersen}%;"
											></div>
										</div>
										<div class="pl-2 text-left text-xs font-bold">
											{dataShow.targetMixA * 100}mL
										</div>
									</div>

									<!-- Mix B-->
									<div class="mb-2 grid grid-cols-6">
										<div class="col-span-2 text-left text-xs font-bold">
											{dataShow.mixBnama}
										</div>
										<div class="col-span-3 h-4 rounded-full bg-gray-200">
											<div
												class="h-4 rounded-full bg-blue-600"
												style="width: {$flowBPersen}%;"
											></div>
										</div>
										<div class="pl-2 text-left text-xs font-bold">
											{dataShow.targetMixB * 100}mL
										</div>
									</div>

									<!-- Mix C-->
									<div class="grid grid-cols-6">
										<div class="col-span-2 text-left text-xs font-bold">
											{dataShow.mixCnama}
										</div>
										<div class="col-span-3 h-4 rounded-full bg-gray-200">
											<div
												class="h-4 rounded-full bg-blue-600"
												style="width: {$flowCPersen}%;"
											></div>
										</div>
										<div class="pl-2 text-left text-xs font-bold">
											{dataShow.targetMixC * 100}mL
										</div>
									</div>
									<div class="text-xs">
										Aduk({dataShow.mixingTarget}detik)
									</div>
								</div>
							</div>
						{:else}
							<div class="mt-4 text-center font-mono text-3xl font-bold">
								{dataShow.sensorVal}{#if dataShow.mode === taskMode.MODE_HUMIDITY}%
								{:else if dataShow.mode === taskMode.MODE_TEMPERATURE}&deg;C
								{:else if dataShow.mode === taskMode.MODE_LENGAS}%
								{/if}
							</div>

							<div class="mt-4 h-4 text-center font-mono text-xs">
								{#if dataShow.mode === taskMode.MODE_HUMIDITY}
									ON:{dataShow.batasBawah} ~ OFF:{dataShow.batasAtas}
								{:else if dataShow.mode === taskMode.MODE_TEMPERATURE}
									OFF:{dataShow.batasBawah} ~ ON:{dataShow.batasAtas}
								{:else if dataShow.mode === taskMode.MODE_LENGAS}
									ON:{dataShow.batasBawah} ~ OFF:{dataShow.batasAtas}
								{/if}
							</div>
							<div style="font-size: xx-small; text-align:center;">lastUpdate</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<footer class="mt-4">
		{#if $networkMode != networkSelect.MODE_LOCAL}
			<div class="grid grid h-10 w-1/2 grid-cols-3 justify-items-center bg-green-100">
				<button on:click={() => bleConnectionToggle()} class="h-8"
					><img
						class="h-6 w-6"
						src={$bleIsConnected ? 'bt2.png' : 'bt1.png'}
						alt="connectBT"
					/></button
				>
				<div>
					<button on:click={() => setupClick(1, $modalMode.SET_DEVICE)} class="h-8">
						<img class="h-6 w-6" src="setup2.png" alt="Setup" /></button
					>
				</div>
				<button on:click={() => mqttConnectionToggle()} class="h-8"
					><img
						class="h-6 w-6"
						src={$mqttIsConnected ? 'wifi.png' : 'no-wifi.png'}
						alt="conectNetwork"
					/></button
				>
			</div>
		{:else}
			<div>
				<button on:click={() => setupClick(1, $modalMode.SET_DEVICE)} class="justify-center">
					<img class="h-8 w-8" src="setup2.png" alt="Setup" /></button
				>
			</div>
		{/if}
		<p></p>

		<p class="mt-2 text-xs">agro kontrol by karjoAgro</p>
	</footer>
{/if}
<Modal class="w-8/10" title={setupTitle} bind:open={defaultModal} autoclose>
	{#if setupMode === 0}
		<div class="mx-auto grid max-w-sm grid-cols-2 gap-2">
			<div class="col-span-2">
				<label for="pilihMode" class="mb-1 block text-xs dark:text-white">Pilih Mode</label>
				<select
					id="pilihSensor"
					bind:value={modeSelect}
					on:change={() => modeSelect_click()}
					class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				>
					{#each modeList as mode, idx}
						<option value={idx}>{mode}</option>
					{/each}
				</select>
			</div>

			<div class="col-span-2">
				<label for="NamaTask" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
					>Nama</label
				>
				<input
					type="text"
					id="namatask"
					bind:value={namaSelect}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder={$myTask[setupIndex].nama}
					required
				/>
			</div>

			{#if $myTask[setupIndex].mode === taskMode.MODE_MIX}
				<div class="col-span-2 ml-4">
					<label for="targetA" class="mb-1 block text-xs dark:text-white"
						>Target {$myTask[setupIndex].mixAnama}
						{targetAValue}mL</label
					>
					<span
						><input
							id="targetA"
							type="range"
							min="100"
							max="1000"
							step="100"
							bind:value={targetAValue}
							class="mb-6 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
							on:change={targetAValue_change}
						/>
					</span>
				</div>

				<div class="col-span-2 ml-4">
					<label for="targetB" class="mb-1 block text-xs dark:text-white"
						>Target {$myTask[setupIndex].mixBnama}
						{targetBValue}mL</label
					>
					<span>
						<input
							id="targetB"
							type="range"
							min="100"
							max="1000"
							step="100"
							bind:value={targetBValue}
							class="mb-6 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
							on:change={targetBValue_change}
						/>
					</span>
				</div>

				<div class="col-span-2 ml-4">
					<label for="targetC" class="mb-1 block text-xs dark:text-white"
						>Target {$myTask[setupIndex].mixCnama}
						{targetCValue}mL</label
					>
					<span>
						<input
							id="targetC"
							bind:value={targetCValue}
							type="range"
							min="100"
							max="2000"
							step="100"
							class="mb-6 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
							on:change={targetCValue_change}
						/>
					</span>
				</div>

				<div>
					<label for="namaMixA" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Nama MixA</label
					>
					<input
						type="text"
						id="namaMixA"
						on:mouseenter={() => mixAClick()}
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder={$myTask[setupIndex].mixAnama}
						required
					/>
				</div>

				<div>
					<label for="namaMixB" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Nama MixB</label
					>
					<input
						type="text"
						id="namaMixB"
						class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						placeholder={$myTask[setupIndex].mixBnama}
						required
					/>
				</div>
			{:else}
				<div>
					<label for="small1" class="mb-1 block text-xs dark:text-white">Pilih Aktuator1</label>
					<select
						bind:value={aktuator1Select}
						on:change={() => aktuatorSelect_click(1)}
						id="small1"
						class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="small2" class="mb-1 block text-xs">Pilih Aktuator2</label>
					<select
						bind:value={aktuator2Select}
						on:change={() => aktuatorSelect_click(2)}
						id="small2"
						class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>

		{#if $myTask[setupIndex].mode === taskMode.MODE_MIX}
			<div></div>
		{:else}
			<div class="my-0">
				<label for="pilihSensor" class="mb-1 block text-xs dark:text-white">Pilih Sensor</label>
				<select
					id="pilihSensor"
					bind:value={sensorSelect}
					on:change={() => sensorSelect_click()}
					class="mb-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
				>
					{#each sensorList as temp, idx}
						<option value={idx}>{temp}</option>
					{/each}
				</select>
			</div>

			<div class="grid grid-cols-2 justify-items-center">
				{#if $myTask[setupIndex].mode == taskMode.MODE_TEMPERATURE}
					<div>OFF({batasBawahValue})</div>
					<div>ON({batasAtasValue})</div>
				{:else}
					<div>ON({batasBawahValue})</div>
					<div>OFF({batasAtasValue})</div>
				{/if}
				<input
					bind:value={batasBawahValue}
					min={minSpinner}
					max={batasAtasValue - 1}
					step="1"
					type="range"
					class="mb-6 h-2 w-5/6 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
					on:change={batasBawahChange}
				/>

				<input
					bind:value={batasAtasValue}
					min={batasBawahValue + 1}
					max={maxSpinner}
					step="1"
					type="range"
					class="mb-6 h-2 w-5/6 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
					on:change={batasAtasChange}
				/>
			</div>
		{/if}
	{:else}
		<!--for setupkontroller network-->
		<div class="mx-auto grid max-w-sm grid-cols-2 gap-4">
			{#if $networkMode === networkSelect.MODE_BT}
				<div class="col-span-2">
					<input
						id="checked-checkbox"
						type="checkbox"
						on:change={() => networkChange()}
						bind:checked={onlineCheck}
						class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
					/>
					<label
						for="checked-checkbox"
						class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Online Mode</label
					>
				</div>
				

				<div class="col-span-2">Wifi Setup</div>
				<input
					type="text"
					id="ssid"
					bind:value={$networkSetup.ssid}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder="SSID"
					required
				/>

				<input
					type="password"
					id="password"
					bind:value={$networkSetup.password}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder="Password"
					required
				/>
			{:else}
				<input
					type="text"
					bind:value={inputID}
					class="col-span-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					placeholder={$kontrolID}
					required
				/>
			{/if}
			<!--

			<div class="col-span-2">Pilih Server</div>

			<select
						bind:value={serverSelect}
						on:change={() => serverSelectChange()}
						
						class="col-span-2 block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each serverList as server, idx}
							<option value={idx}>{server}</option>
						{/each}
					</select>

		-->
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button color="red">Keluar</Button>
		<Button color="green" on:click={() => simpanTask()}>Simpan</Button>
	</svelte:fragment>
</Modal>

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		display: flex;
		flex-direction: column;
		min-height: 100vh;

		width: 100%; /* Lebar elemen 100% dari lebar kontainer */
		height: 100%; /* Tinggi elemen */
		background-image: url('/tumbuh1.jpeg'); /* URL gambar */
		background-size: cover; /* Sesuaikan gambar agar menutupi elemen */
		background-position: center; /* Pusatkan gambar */

		background-repeat: no-repeat; /* Jangan ulangi gambar */
	}
	section {
		display: flex;
		flex-direction: column;
		justify-content: top;
		align-items: top;
		margin-top: 12px;
		margin-bottom: 8px;
		margin-left: 16px;
		margin-right: 16px;
		flex: 0.6;
	}

	.no-select {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
