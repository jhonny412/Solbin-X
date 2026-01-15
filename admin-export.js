
// Export to Excel with proper XML format for styling
window.exportOrdersToExcel = function () {
    const orders = window.allAdminOrders;

    if (!orders || orders.length === 0) {
        Swal.fire('Atención', 'No hay datos para exportar. Primero haz clic en "Actualizar".', 'info');
        return;
    }

    // Excel XML Spreadsheet format - this format properly supports styling
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0284C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="Center">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="Bold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="Money">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:Bold="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="Iniciado">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Color="#1E40AF"/>
   <Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="EnProceso">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Color="#92400E"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="Terminado">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Color="#065F46"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="Cancelado">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Ventas SolbinX">
  <Table>
   <Column ss:Width="80"/>
   <Column ss:Width="150"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="300"/>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">ID PEDIDO</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">FECHA</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">CLIENTE (WHATSAPP)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">TOTAL (S/.)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">ESTADO</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">PRODUCTOS</Data></Cell>
   </Row>`;

    orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleString('es-PE');
        const phone = order.customer_info?.phone || 'N/A';
        const total = 'S/. ' + parseFloat(order.total).toFixed(2);

        // Status styling
        let status = order.status;
        let statusStyle = 'Center';

        if (status === 'iniciado') {
            status = 'INICIADO';
            statusStyle = 'Iniciado';
        } else if (status === 'en_proceso') {
            status = 'EN PROCESO';
            statusStyle = 'EnProceso';
        } else if (status === 'terminado') {
            status = 'FINALIZADO';
            statusStyle = 'Terminado';
        } else if (status === 'cancelado') {
            status = 'CANCELADO';
            statusStyle = 'Cancelado';
        }

        // Parse items
        let itemsStr = '';
        let items = order.items;
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch (e) { }
        }
        if (Array.isArray(items)) {
            itemsStr = items.map(i => `${i.quantity}x ${i.name} (S/.${i.price})`).join(', ');
        }

        // Escape XML special characters
        itemsStr = itemsStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        xml += `
   <Row>
    <Cell ss:StyleID="Bold"><Data ss:Type="String">#${order.id}</Data></Cell>
    <Cell ss:StyleID="Center"><Data ss:Type="String">${date}</Data></Cell>
    <Cell ss:StyleID="Center"><Data ss:Type="String">${phone}</Data></Cell>
    <Cell ss:StyleID="Money"><Data ss:Type="String">${total}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${status}</Data></Cell>
    <Cell ss:StyleID="Normal"><Data ss:Type="String">${itemsStr}</Data></Cell>
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    // Create download
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const today = new Date().toISOString().slice(0, 10);
    const filename = `Ventas_SolbinX_${today}.xls`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
        icon: 'success',
        title: 'Exportación Exitosa',
        text: `Se descargó: ${filename}`,
        timer: 2000,
        showConfirmButton: false
    });
}

