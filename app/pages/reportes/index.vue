<template>
    <!-- Filtros principales -->
    <div class="p-4 rounded-2xl bg-white shadow mb-5 border border-slate-200">
        <div class="grid grid-cols-3 gap-4 mb-4">
            <Dropdown v-model="reportType" :options="availableReports" optionLabel="label" optionValue="value"
                placeholder="Seleccionar reporte" class="w-full" />


            <!-- fechas-->
            <template v-if="reportType === 'RESERVATIONS' || reportType === 'POPULAR_HOURS'">
                <DatePicker v-model="startDate" placeholder="Fecha de inicio" dateFormat="dd/mm/yy" class="w-full" />
                <DatePicker v-model="endDate" placeholder="Fecha de fin" dateFormat="dd/mm/yy" class="w-full" />
            </template>
        </div>


        <!-- botones -->
        <div class="flex flex-wrap gap-3 mt-4">
            <Button icon="pi pi-file-pdf" label="Exportar PDF" @click="exportReports" rounded outlined />
            <Button icon="pi pi-search" label="Filtrar" @click="filtrar" rounded outlined severity="info" />
            <Button icon="pi pi-refresh" label="Quitar Filtros" @click="recargarDatos" rounded outlined
                severity="help" />
        </div>
    </div>

    <template v-if="(reportType === 'FINANCIAL_REPORT') && globalFinancialSummary">
        <div class="p-4 mb-4 rounded-xl border border-slate-300 bg-slate-50 shadow-sm">
            <h3 class="text-slate-800 text-lg font-semibold mb-3">Resumen financiero global</h3>
            <div class="grid grid-cols-3 gap-4 text-sm text-slate-700">
                <div class="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span class="font-medium">Total de ingresos:</span>
                    <div class="text-green-700 font-semibold"> {{
                        globalFinancialSummary.totalSales ? "Q " + globalFinancialSummary.totalSales : "-" }}</div>
                </div>
                <div class="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span class="font-medium">Total de gastos:</span>
                    <div class="text-red-700 font-semibold"> {{
                        globalFinancialSummary.totalCost ? "Q " + globalFinancialSummary.totalCost : "-" }}</div>
                </div>
                <div class="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span class="font-medium">Total de ganancias:</span>
                    <div class="text-blue-700 font-semibold"> {{ globalFinancialSummary.totalProfit ?
                        "Q " + globalFinancialSummary.totalProfit : "-" }}</div>
                </div>
            </div>
        </div>
    </template>


    <div class="text-slate-700 font-semibold mb-3" v-if="totalReservations !== null">
        Total de reservaciones: {{ totalReservations }}
    </div>


    <!-- tabla de resultados -->
    <DataTable :value="reportData.data" v-model:expandedRows="expandedRows" rowExpansionMode="single"
        :dataKey="tableConfig.dataKey" v-if="tableConfig" class="shadow-md border border-slate-200 rounded-xl ">
        <template #header>
            <div class=" px-4 py-2">
                <span class="text-lg font-bold text-slate-800">
                    {{ tableConfig.reportHeader }}
                </span>
            </div>
        </template>



        <!-- columnas dinámicas -->
        <Column v-for="col in tableConfig.columns" :key="col.field" :field="col.field" :header="col.header">
            <template #body="slotProps">
                {{ col.render ? col.render(slotProps.data) : slotProps.data[col.field] }}
            </template>
        </Column>


    </DataTable>
</template>


<script setup lang="ts">
import { ref, onMounted, render } from 'vue'
import { toast } from 'vue-sonner';
import { boolean } from 'zod';
import { getReservationReport, exportReservationReport, getPopularHoursBetweenDates, exportPopularHoursBetweenDates } from '~/lib/api/reportes/reporte';


//esto indica que las rows seran reactivas, se podran modificar, y por lo tanto se puede cambiar el valor y vue lo detectara
const expandedRows = ref({});
//esto indica que el tipo de reporte sera reactivo, y por lo tanto se puede cambiar el valor y vue lo detectara
const reportType = ref('RESERVATIONS');

//inputs que siven para el filtrado de los reportes
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)


//este ref va a guardar los datos finanicieros totales de todos los reportes que lo poseean
//va a reaccionar con lo que mande el back entonces los nombres deben coincidir
const globalFinancialSummary = ref<{
    totalSales: number,
    totalProfit: number,
    totalCost: number
} | null>(null);





/**
 * Ref que contiene la data del reporte, es reactivo y se va a modificar dependiendo del tipo de reporte seleccionado.
 * Por defecto la data es un array vacio.
 */
const reportData = ref<{
    data: Array<any>
}>({
    data: [
    ],
});

/**
 * Array que contiene los tipos de reportes disponibles, cada uno tiene un valor y una etiqueta 
 * el valor es el que se va a usar para filtrar la data y la etiqueta es la que se va a mostrar en el dropdown
 */
const availableReports = [
    { value: 'RESERVATIONS', label: 'Reporte de Reservaciones' },
    { value: 'POPULAR_HOURS', label: 'Reporte de Horarios con Mayor Demanda' },
]

const totalReservations = ref<number | null>(null);





const reservationsTableCOnfig =
{
    dataKey: 'id',
    reportHeader: 'Reporte de Reservas',
    columns: [
        { field: 'id', header: 'Id' },
        { field: 'date', header: 'Fecha' },
        { field: 'startTime', header: 'Hora inicio' },
        { field: 'endTime', header: 'Hora final' },
        {
            field: 'paid', header: 'Pagado',
            render: (row: any) => row.isPaid ? 'Si' : 'No'
        },
        {
            field: 'cancelled', header: 'Cancelado',
            render: (row: any) => row.isPaid ? 'Si' : 'No'
        },
    ]
}

const popularHoursTableConfig =
{
    dataKey: 'startTime',
    reportHeader: 'Reporte de Horarios con Mayor Demanda ',
    columns: [

        { field: 'startTime', header: 'Hora inicio' },
        { field: 'endTime', header: 'Hora final' },
        { field: 'total', header: 'Total reservaciones' },
    ]
}



/**
 * Ref que define la configuracion de la tabla, es reactivo y se va a modificar dependiendo del tipo de reporte seleccionado
 */
const tableConfig = ref<{
    dataKey: string,
    reportHeader: string;//esto va indicar el header del listado general
    columns: {
        field: string;
        header: string;
        render?: (row: any) => string | VNode;
    }[];
}>(reservationsTableCOnfig);

/**
 * Metodo que se ejecuta al cargar el componente, se encarga de cargar automarticamente el reporte seleccionado
 * en el dropdown.
 */
onMounted(async () => {
    await cargarReporteActual()
})



/**
 * Configura la distribucion de la tabla, manda a trear la data segun e ltipo de reporte seleccionado
 * y la setea en el objeto reportData
 */
const cargarReporteActual = async () => {
    try {
        //cargamos el reporte actual dependiendo del tipo de reporte seleccionado
        switch (reportType.value) {
            case 'RESERVATIONS':
                tableConfig.value = reservationsTableCOnfig;
                const reservationReport = await getReservationReport(
                    startDate.value,
                    endDate.value
                );
                reportData.value.data = reservationReport.reservations;
                totalReservations.value = reservationReport.totalReservations;
                break;

            case 'POPULAR_HOURS':
                tableConfig.value = popularHoursTableConfig;
                const popularHours = await getPopularHoursBetweenDates(
                    startDate.value,
                    endDate.value
                );
                reportData.value.data = popularHours.popularHours;
                totalReservations.value = popularHours.totalReservations;
                break;
            default:
                reportData.value.data = []
        }
    } catch (error: any) {
        toast.error('Error', { description: `${(error.message)}` })
    }

}


const exportReports = async () => {
    try {
        switch (reportType.value) {
            case 'RESERVATIONS':
                await exportReservationReport(
                    startDate.value,
                    endDate.value
                );
                break;
            case 'POPULAR_HOURS':
                await exportPopularHoursBetweenDates(
                    startDate.value,
                    endDate.value
                );
                break;
            default:
        }
    } catch (error: any) {
        toast.error('Error', { description: `${(error.message)}` })
    }
}

watch(reportType, async () => {
    await cargarReporteActual();
});

const recargarDatos = async () => {
    //elimina cualquier filtro y manda a cargar el reporte seleccionado de nuevo
    startDate.value = null;
    endDate.value = null;
    // volvemos a cargar el reporte con filtros vacíos
    await cargarReporteActual();
};


/**
 * Manda a recargar el reporte para que tome en cuenta los filtros
 */
const filtrar = async () => {
    await cargarReporteActual();
};




</script>