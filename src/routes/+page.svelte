<script>
    import { Button, Modal } from "flowbite-svelte";

    import { onMount } from "svelte";
    import { get } from "svelte/store";

    import {
        dataTask,
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
    } from "$lib/stores";

    let defaultModal = false;
    let dataTaskNow = null;

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
    let sensorList = ["sensor1", "sensor2"];
    let setupTitle = "Setup";
    let sensorUseType = sensorType.TEMPERATURE;
    // @ts-ignore
    let lastMsg = null;

    

    // @ts-ignore
    let header = "Temperature";
    const myKontrolID = get(kontrolID);
    let inputID = myKontrolID 

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
        setTimeout(getTask, 1000);
        setTimeout(openFullscreen, 3000);
        if ($networkMode === networkSelect.MODE_LOCAL) {
            setTimeout(getNetwork, 1000);
            setInterval(getLocalStatus, 2000);
        }
    });

    // @ts-ignore
    const aktuatorList = ["Aktuator1", "Aktuator2", "Aktuator3", "Aktuator4"];

    const sensorLengasList = ["Sensor Lengas1", "Sensor Lengas2"];

    const sensorTemperatureList = [
        "Sensor Temperature1",
        "Sensor Temperature2",
    ];
    const sensorHumidityList = ["Sensor Humidity1", "Sensor Humidity2"];

    const sensorIntermittentList = [
        "Sensor Intermittent1",
        "Sensor Intermittent2",
    ];
    const serverList = ["server1", "server2", "server3"];

    const modeList = [
        "Mode Temperature",
        "Mode Humidity",
        "Mode Lengas",
        "Mode intermittent",
        "Mode Mix",
    ];

    let setupIndex = 0;
    let setupMode = 0; //0 mode set task,1 mode set device
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
        kirimMsg("0", 1, "getAllTask", "1");
    }

    function getNetwork() {
        kirimMsg("0", 1, "getNetwork", "1");
    }
    // @ts-ignore
    function enableClick(idx) {
        const lastEnableStatus = $dataTask[idx].enable;
        if ($dataTask[idx].enable == 0) {
            $dataTask[idx].enable = 1;
        } else {
            $dataTask[idx].enable = 0;
        }

        if (!kirimMsg(idx + 1, 1, "enable", String($dataTask[idx].enable))) {
            $dataTask[idx].enable = lastEnableStatus;
        }
    }

    // @ts-ignore
    export function setupClick(idx, mode) {
        defaultModal = true;
        setupIndex = idx;
        setupMode = mode;
        if (mode === 0) {
            setupTitle = "Setup Auto" + $dataTask[idx].nama;
            modeSelect = $dataTask[idx].taskMode;
            namaSelect = $dataTask[idx].nama;
            sensorSelect = $dataTask[idx].sensorUse - 1;

            //alert($dataTask[idx].nama)
            //set pilih aktuator sesai data
            aktuator1Select = $dataTask[idx].aktuatorUse1 - 1;
            aktuator2Select = $dataTask[idx].aktuatorUse2 - 1;

            targetAValue = $dataTask[idx].targetMixA * 100;
            targetBValue = $dataTask[idx].targetMixB * 100;
            targetCValue = $dataTask[idx].targetMixC * 100;

            // sensorList = sensorTemperatureList
            if ($dataTask[idx].taskMode === taskMode.MODE_TEMPERATURE) {
                sensorList = sensorTemperatureList;
                batasBawahValue = $dataTask[idx].targetBawah;
                batasAtasValue = $dataTask[idx].targetAtas;
                minSpinner = 10;
                maxSpinner = 100;
            } else if ($dataTask[idx].taskMode === taskMode.MODE_HUMIDITY) {
                sensorList = sensorHumidityList;
                batasBawahValue = $dataTask[idx].targetBawah;
                batasAtasValue = $dataTask[idx].targetAtas;
                minSpinner = 10;
                maxSpinner = 100;
            } else if ($dataTask[idx].taskMode === taskMode.MODE_LENGAS) {
                sensorList = sensorLengasList;
                batasBawahValue = $dataTask[idx].targetBawah;
                batasAtasValue = $dataTask[idx].targetAtas;
                minSpinner = 10;
                maxSpinner = 100;
            } else if ($dataTask[idx].taskMode === taskMode.MODE_INTERMITTEN) {
                sensorList = sensorIntermittentList;
                batasBawahValue = $dataTask[idx].targetBawah - 15;
                batasAtasValue = $dataTask[idx].targetAtas - 15;
                minSpinner = -15;
                maxSpinner = 15;
            }
        } else {
            //mode setup device
            setupTitle = "Setup " + $kontrolID;
        }
    }

    function aktuatorSelect_click(num = 1) {
        const tp = "auto" + $dataTask[setupIndex].nama;

        if (num == 1) {
            $dataTask[setupIndex].aktuatorUse1 = aktuator1Select + 1;
            //alert("pilih aktuator1 " + (aktuator1Select + 1));
        } else if (num == 2) {
            $dataTask[setupIndex].aktuatorUse2 = aktuator2Select + 1;
            //alert("pilih aktuator2 " + (aktuator2Select + 1));
        }
    }
    function sensorSelect_click() {
        const tp = "auto" + $dataTask[setupIndex].nama;

        $dataTask[setupIndex].sensorUse = sensorSelect + 1;

        //alert("sensor temperture select: " + sensorSelect + 1);
    }
    let modeSelect = 0;
    let namaSelect = "";

    function modeSelect_click() {
        const tp = "auto" + $dataTask[setupIndex].nama;

        $dataTask[setupIndex].taskMode = modeSelect;

        // sensorList = sensorTemperatureList
        if (modeSelect === taskMode.MODE_TEMPERATURE) {
            sensorList = sensorTemperatureList;
            batasBawahValue = $dataTask[setupIndex].targetBawah;
            batasAtasValue = $dataTask[setupIndex].targetAtas;
            sensorUseType = sensorType.TEMPERATURE;
            minSpinner = 10;
            maxSpinner = 100;
            namaSelect = "Temperature";
        } else if (modeSelect === taskMode.MODE_HUMIDITY) {
            sensorList = sensorHumidityList;
            batasBawahValue = $dataTask[setupIndex].targetBawah;
            batasAtasValue = $dataTask[setupIndex].targetAtas;
            sensorUseType = sensorType.HUMIDITY;
            minSpinner = 10;
            maxSpinner = 100;
            namaSelect = "Humidity";
        } else if (modeSelect === taskMode.MODE_LENGAS) {
            sensorList = sensorLengasList;
            batasBawahValue = $dataTask[setupIndex].targetBawah;
            batasAtasValue = $dataTask[setupIndex].targetAtas;
            sensorUseType = sensorType.LENGAS;
            minSpinner = 10;
            maxSpinner = 100;
            namaSelect = "Lengas";
        } else if (modeSelect === taskMode.MODE_INTERMITTEN) {
            sensorList = sensorIntermittentList;
            batasBawahValue = $dataTask[setupIndex].targetBawah - 15;
            batasAtasValue = $dataTask[setupIndex].targetAtas - 15;
            sensorUseType = sensorType.LENGAS_LASER;
            minSpinner = -15;
            maxSpinner = 15;
            namaSelect = "Intermittent";
        }
        setupTitle = "Setup Auto" + namaSelect;

        //console.log("Mode select: " + modeList[modeSelect])
    }

    let serverSelect = 0;

    function serverSelectChange() {
        console.log("Server select: " + serverList[serverSelect]);
    }

    function batasBawahChange() {
        const tp = "auto" + $dataTask[setupIndex].nama;
        if ($dataTask[setupIndex].taskMode === taskMode.MODE_INTERMITTEN) {
            $dataTask[setupIndex].targetBawah = batasBawahValue + 15;
        } else {
            $dataTask[setupIndex].targetBawah = batasBawahValue;
        }

        //alert("Target bawah: " + batasBawahValue);
    }

    function batasAtasChange() {
        const tp = "auto" + $dataTask[setupIndex].nama;
        if ($dataTask[setupIndex].taskMode === taskMode.MODE_INTERMITTEN) {
            $dataTask[setupIndex].targetAtas = batasAtasValue + 15;
        } else {
            $dataTask[setupIndex].targetAtas = batasAtasValue;
        }

        //alert("Target atas: " + batasAtasValue);
    }

    function targetAValue_change() {
        const tp = "auto" + $dataTask[setupIndex].nama;
        $dataTask[setupIndex].targetMixA = targetAValue / 100;
        //alert(
        //	"Target " +
        //		$dataTask[setupIndex].mixANama +
        //		":" +
        //		targetAValue +
        //		"mL",
        //);
    }

    function targetBValue_change() {
        const tp = "auto" + $dataTask[setupIndex].nama;

        $dataTask[setupIndex].targetMixB = targetBValue / 100;
        /*
		alert(
			"Target " +
				$dataTask[setupIndex].mixBNama +
				":" +
				targetBValue +
				"mL",
		);
		**/
    }

    function targetCValue_change() {
        const tp = "auto" + $dataTask[setupIndex].nama;

        $dataTask[setupIndex].targetMixC = targetCValue / 100;

        /*alert(
			"Target " +
				$dataTask[setupIndex].mixCNama +
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
            $dataTask[setupIndex].nama = namaSelect;
            $dataTask[setupIndex].taskMode = modeSelect;
            $dataTask[setupIndex].sensorUseType = sensorUseType;
            kirimMsg(
                setupIndex + 1,
                1,
                "updateTask",
                JSON.stringify($dataTask[setupIndex]),
            );
            console.log(
                "Update Task: " + JSON.stringify($dataTask[setupIndex]),
            );
        } else {
            //simpan
            if($networkMode === networkSelect.MODE_LOCAL){

            
            kirimMsg("0", 1, "updateServer", JSON.stringify($networkSetup));
            }else{
                //simpan kontrol id
                kontrolID.set(inputID)
                
            }
        }
    }

    let onlineCheck = false;

    function networkChange() {
        console.log("online check " + onlineCheck);
        if (onlineCheck) {
            $networkSetup.mode = false;
        } else {
            $networkSetup.mode = true;
        }
    }

    //update dataTask
    // $: dataTask = dataTask
</script>

<svelte:head>
    <title>KarjoAgro</title>
    <meta name="description" content="karjoAgro kontrol" />
</svelte:head>

<section class="app mainbg">
    <!--Header-->
    <div class="text-sm text-center">karjoAgro</div>
    <div class="text-4xl font-bold font-mono text-white text-center">
        Agro Kontrol
    </div>
    <div class="text-xs text-center text-white mb-8">{$networkMode}</div>
    <div class="grid grid-cols-2 w-full gap-8 no-select">
        {#each $dataTask as dataShow, idx}
            <div class="h-42 w-full p-0 bg-white rounded-lg shadow">
                <button
                    class={dataShow.enable == 0
                        ? "h-8 w-full mt-0 bg-red-500  text-white text-sm text-center font-monospace font-bold "
                        : "h-8 w-full mt-0 bg-green-500  text-white text-sm text-center font-monospace font-bold "}
                    on:click={() => enableClick(idx)}
                >
                    Auto{dataShow.nama}
                </button>

                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="h-24 w-full justify-items-center"
                    on:dblclick={() => setupClick(idx, 0)}
                >
                    {#if dataShow.taskMode === taskMode.MODE_INTERMITTEN}
                        <div
                            class="grid grid-cols-3 gap-2 place-items-center w-full h-24 mt-2"
                        >
                            <div class="w-full h-3/4 flex justify-center">
                                <div
                                    class="w-6 bg-indigo-700 rounded-full h-full"
                                >
                                    <div
                                        class="bg-gray-200 w-6 rounded-full rounded-b-none"
                                        style="height: {100 -
                                            (dataShow.sensorValue / 30) *
                                                100}%;"
                                    ></div>
                                </div>
                            </div>

                            <div class="col-span-2">
                                <div
                                    class=" text-center font-mono font-bold text-2xl w-full content-center"
                                >
                                    {dataShow.sensorValue - 15}<small
                                        ><small> cm</small></small
                                    >
                                </div>
                                <div
                                    style="font-size: x-small;text-align:center"
                                >
                                    ON:{dataShow.targetBawah - 15} ~ OFF:{dataShow.targetAtas -
                                        15}
                                </div>
                                <div
                                    style="font-size:xx-small;"
                                    class="text-center"
                                >
                                    lastUpdate
                                </div>
                            </div>
                        </div>
                    {:else if dataShow.taskMode === taskMode.MODE_MIX}
                        <div class="w-full h-full flex justify-center">
                            <div class="h-full w-5/6 mt-2">
                                <!-- Mix A-->
                                <div class="grid grid-cols-6 mb-2">
                                    <div
                                        class="col-span-2 text-xs font-bold text-left"
                                    >
                                        {dataShow.mixANama}
                                    </div>
                                    <div
                                        class="col-span-3 bg-gray-200 rounded-full h-4"
                                    >
                                        <div
                                            class="h-4 bg-blue-600 rounded-full"
                                            style="width: {$flowAPersen}%;"
                                        ></div>
                                    </div>
                                    <div
                                        class="text-xs font-bold text-left pl-2"
                                    >
                                        {dataShow.targetMixA * 100}mL
                                    </div>
                                </div>

                                <!-- Mix B-->
                                <div class="grid grid-cols-6 mb-2">
                                    <div
                                        class="col-span-2 text-xs font-bold text-left"
                                    >
                                        {dataShow.mixBNama}
                                    </div>
                                    <div
                                        class="col-span-3 bg-gray-200 rounded-full h-4"
                                    >
                                        <div
                                            class="h-4 bg-blue-600 rounded-full"
                                            style="width: {$flowBPersen}%;"
                                        ></div>
                                    </div>
                                    <div
                                        class="text-xs font-bold text-left pl-2"
                                    >
                                        {dataShow.targetMixB * 100}mL
                                    </div>
                                </div>

                                <!-- Mix C-->
                                <div class="grid grid-cols-6">
                                    <div
                                        class="col-span-2 text-xs font-bold text-left"
                                    >
                                        {dataShow.mixCNama}
                                    </div>
                                    <div
                                        class="col-span-3 bg-gray-200 rounded-full h-4"
                                    >
                                        <div
                                            class="h-4 bg-blue-600 rounded-full"
                                            style="width: {$flowCPersen}%;"
                                        ></div>
                                    </div>
                                    <div
                                        class="text-xs font-bold text-left pl-2"
                                    >
                                        {dataShow.targetMixC * 100}mL
                                    </div>
                                </div>
                                <div class="text-xs">
                                    Aduk({dataShow.mixingTarget}detik) > {dataShow.mixingCount}
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div
                            class="mt-4 text-center font-mono font-bold text-3xl"
                        >
                            {dataShow.sensorValue}{#if dataShow.taskMode === taskMode.MODE_HUMIDITY}%
                            {:else if dataShow.taskMode === taskMode.MODE_TEMPERATURE}&deg;C
                            {:else if dataShow.taskMode === taskMode.MODE_LENGAS}%
                            {:else}Cm{/if}
                        </div>

                        <div class="text-center font-mono text-xs h-4 mt-4">
                            {#if dataShow.taskMode === taskMode.MODE_HUMIDITY}
                                ON:{dataShow.targetBawah} ~ OFF:{dataShow.targetAtas}
                            {:else if dataShow.taskMode === taskMode.MODE_TEMPERATURE}
                                OFF:{dataShow.targetBawah} ~ ON:{dataShow.targetAtas}
                            {:else if dataShow.taskMode === taskMode.MODE_LENGAS}
                                ON:{dataShow.targetBawah} ~ OFF:{dataShow.targetAtas}
                            {/if}
                        </div>
                        <div style="font-size: xx-small; text-align:center;">
                            lastUpdate
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>

    <Modal class="w-6/10" title={setupTitle} bind:open={defaultModal} autoclose>
        {#if setupMode === 0}
            <div class="max-w-sm mx-auto grid grid-cols-2 gap-2">
                <div class="col-span-2">
                    <label
                        for="pilihMode"
                        class="block mb-1 text-xs dark:text-white"
                        >Pilih Mode</label
                    >
                    <select
                        id="pilihSensor"
                        bind:value={modeSelect}
                        on:change={() => modeSelect_click()}
                        class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                        {#each modeList as mode, idx}
                            <option value={idx}>{mode}</option>
                        {/each}
                    </select>
                </div>

                <div class="col-span-2">
                    <label
                        for="NamaTask"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Nama</label
                    >
                    <input
                        type="text"
                        id="namatask"
                        bind:value={namaSelect}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder={$dataTask[setupIndex].nama}
                        required
                    />
                </div>

                {#if $dataTask[setupIndex].taskMode === taskMode.MODE_MIX}
                    <div class="ml-4 col-span-2">
                        <label
                            for="targetA"
                            class="block mb-1 text-xs dark:text-white"
                            >Target {$dataTask[setupIndex].mixANama}
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
                                class="w-full h-2 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                on:change={targetAValue_change}
                            />
                        </span>
                    </div>

                    <div class="ml-4 col-span-2">
                        <label
                            for="targetB"
                            class="block mb-1 text-xs dark:text-white"
                            >Target {$dataTask[setupIndex].mixBNama}
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
                                class="w-full h-2 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                on:change={targetBValue_change}
                            />
                        </span>
                    </div>

                    <div class="ml-4 col-span-2">
                        <label
                            for="targetC"
                            class="block mb-1 text-xs dark:text-white"
                            >Target {$dataTask[setupIndex].mixCNama}
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
                                class="w-full h-2 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                on:change={targetCValue_change}
                            />
                        </span>
                    </div>

                    <div>
                        <label
                            for="namaMixA"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Nama MixA</label
                        >
                        <input
                            type="text"
                            id="namaMixA"
                            on:mouseenter={() => mixAClick()}
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder={$dataTask[setupIndex].mixANama}
                            required
                        />
                    </div>

                    <div>
                        <label
                            for="namaMixB"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Nama MixB</label
                        >
                        <input
                            type="text"
                            id="namaMixB"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder={$dataTask[setupIndex].mixBNama}
                            required
                        />
                    </div>
                {:else}
                    <div>
                        <label
                            for="small1"
                            class="block mb-1 text-xs dark:text-white"
                            >Pilih Aktuator1</label
                        >
                        <select
                            bind:value={aktuator1Select}
                            on:change={() => aktuatorSelect_click(1)}
                            id="small1"
                            class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {#each aktuatorList as aktuator, idx}
                                <option value={idx}>{aktuator}</option>
                            {/each}
                        </select>
                    </div>
                    <div>
                        <label for="small2" class="block mb-1 text-xs"
                            >Pilih Aktuator2</label
                        >
                        <select
                            bind:value={aktuator2Select}
                            on:change={() => aktuatorSelect_click(2)}
                            id="small2"
                            class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {#each aktuatorList as aktuator, idx}
                                <option value={idx}>{aktuator}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
            </div>

            {#if $dataTask[setupIndex].taskMode === taskMode.MODE_MIX}
                <div></div>
            {:else}
                <div class="my-0">
                    <label
                        for="pilihSensor"
                        class="block mb-1 text-xs dark:text-white"
                        >Pilih Sensor</label
                    >
                    <select
                        id="pilihSensor"
                        bind:value={sensorSelect}
                        on:change={() => sensorSelect_click()}
                        class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                        {#each sensorList as temp, idx}
                            <option value={idx}>{temp}</option>
                        {/each}
                    </select>
                </div>

                <div class="grid grid-cols-2 justify-items-center">
                    {#if $dataTask[setupIndex].taskMode == taskMode.MODE_TEMPERATURE}
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
                        class="w-5/6 h-2 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        on:change={batasBawahChange}
                    />

                    <input
                        bind:value={batasAtasValue}
                        min={batasBawahValue + 1}
                        max={maxSpinner}
                        step="1"
                        type="range"
                        class="w-5/6 h-2 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        on:change={batasAtasChange}
                    />
                </div>
            {/if}
        {:else}
            <!--for setupkontroller network-->
            <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                {#if $networkMode === networkSelect.MODE_LOCAL}
                    <div class="col-span-2">
                        <input
                            id="checked-checkbox"
                            type="checkbox"
                            on:change={() => networkChange()}
                            bind:checked={onlineCheck}
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                            for="checked-checkbox"
                            class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >Online Mode</label
                        >
                    </div>

                    <div class="col-span-2">Wifi Setup</div>
                    <input
                        type="text"
                        id="ssid"
                        bind:value={$networkSetup.ssid}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="SSID"
                        required
                    />

                    <input
                        type="password"
                        id="password"
                        bind:value={$networkSetup.password}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Password"
                        required
                    />
                {:else}
                    <input
                        type="text"                        
                        bind:value={inputID}
                        class="col-span-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
</section>

<footer class="mt-4">
    {#if $networkMode != networkSelect.MODE_LOCAL}
        <div
            class="grid grid-cols-3 w-1/2 h-10 bg-green-100 grid justify-items-center"
        >
            <button on:click={() => bleConnectionToggle()} class="h-8"
                ><img
                    class="h-6 w-6"
                    src={$bleIsConnected ? "bt2.png" : "bt1.png"}
                    alt="connectBT"
                /></button
            >
            <div>
                <button on:click={() => setupClick(1, 1)} class="h-8">
                    <img
                        class="h-6 w-6"
                        src="setup2.png"
                        alt="Setup"
                    /></button
                >
            </div>
            <button on:click={() => mqttConnectionToggle()} class="h-8"
                ><img
                    class="h-6 w-6"
                    src={$mqttIsConnected ? "wifi.png" : "no-wifi.png"}
                    alt="conectNetwork"
                /></button
            >
        </div>
    {:else}
        <div>
            <button on:click={() => setupClick(1, 1)} class="justify-center">
                <img class="h-8 w-8" src="setup2.png" alt="Setup" /></button
            >
        </div>
    {/if}
    <p></p>

    <p class="text-xs mt-2">agro kontrol by karjoAgro</p>
</footer>

<style lang="postcss">
    @reference "tailwindcss";
  :global(html) {
    
			display: flex;
			flex-direction: column;
			min-height: 100vh;
	
	
			width: 100%; /* Lebar elemen 100% dari lebar kontainer */
			height: 100%; /* Tinggi elemen */
			background-image: url("/tumbuh1.jpeg"); /* URL gambar */
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
