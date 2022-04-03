let db = openDatabase("db.takjil", "2.0", "Takjil DataBase", 2 * 1024 * 1024);
// module.exports = {db}
const username = localStorage.getItem("username");
const password = localStorage.getItem("password");
window.onload = function () {
	if (username == null && password == null) {
		alert("Please Login First");
		window.location.href = "./signin/index.html";
	}
	$(".myinfo .name").text(username);
};

$(document).ready(function () {
	db.transaction(function (transaction) {
		let sql =
			"CREATE TABLE if not exists masjid" +
			"(id_masjid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
			"id_user VARCHAR (50) NOT NULL," +
			"nama_masjid VARCHAR (50) NOT NULL," +
			"alamat_masjid VARCHAR (50) NOT NULL)";
		transaction.executeSql(
			sql,
			undefined,
			function (transaction, result) {},
			function (transaction, err) {
				console.log(err.message);
			}
		);

		db.transaction(function (transaction) {
			let sql =
				"CREATE TABLE if not exists warga" +
				"(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
				"id_masjid VARVHAR(100) NOT NULL," +
				"nama_warga VARCHAR(100) NULL," +
				"alamat_warga VARCHAR(100) NULL," +
				"RT INTEGER NULL," +
				"total_kontribusi INTEGER NULL)";
			transaction.executeSql(sql, undefined);
		});
});
	// CRUD
	// loadData();
	showList();
	$(".rightPanel").on(
		"click",
		`#${localStorage.getItem("namaMasjid")} .delete`,
		function () {
			swal({
				title: "Do you want to delete all data?",
				icon: "warning",
				buttons: true,
				dangerMode: true,
			}).then((willDeleteTable) => {
				if (willDeleteTable) {
					db.transaction(function (transaction) {
						const namaMasjid = localStorage.getItem("namaMasjid");
						let sql = "DELETE FROM warga WHERE id_masjid ='" + namaMasjid + "'";
						transaction.executeSql(
							sql,
							undefined,
							function () {
								swal("Success", {
									icon: "success",
								});
							},
							function (transaction, err) {
								swal(err.message, {
									icon: "error",
								});
							}
						);
					});
					loadData();
				} else {
					return;
				}
			});
		}
	);

	$(".rightPanel").on(
		"click",
		`#${localStorage.getItem("namaMasjid")} .insert`,
		function () {
			let id_masjid = localStorage.getItem("namaMasjid");
			let personName = $(
				`#${localStorage.getItem("namaMasjid")} .personName`
			).val();
			let address = $(`#${localStorage.getItem("namaMasjid")} .address`).val();
			let RT = $(`#${localStorage.getItem("namaMasjid")} .RT`).val();
			let total = $(`#${localStorage.getItem("namaMasjid")} .total`).val();
			if (personName == "" || address == "" || RT == "" || total == "") {
				return alert("FIELD CANNOT BE EMPTY");
			}
			if (RT == "0" || total == "0") {
				return alert("Value must be greater than or equal to 1");
			}

			db.transaction(function (transaction) {
				let sql =
					"INSERT INTO warga(id_masjid, nama_warga, alamat_warga, RT, total_kontribusi) VALUES(?, ?, ?, ?, ?)";
				transaction.executeSql(
					sql,
					[id_masjid, personName, address, RT, total],
					function () {
						swal("Success", {
							icon: "success",
						});
					},
					function (transaction, err) {
						alert(err.message);
					}
				);
			});
			$(".personName").val("");
			$(".address").val("");
			$(".RT").val("");
			$(".total").val("");
			loadData();
		}
	);

	$(".rightPanel").on(
		"click",
		`#${localStorage.getItem("namaMasjid")} .cancel`,
		function () {
			$(".update").hide();
			$(".insert").show();
			$(".cancel").hide();
			$(".personName").val("");
			$(".address").val("");
			$(".RT").val("");
			$(".total").val("");
		}
	);

	$("#showData").click(function () {
		const namaMasjid = localStorage.getItem("namaMasjid");
		localStorage.setItem("isShowDataChecked", true);
		const listRT = [];

		$(this).removeClass("mb-5");
		$(this).addClass(" mb-2 ");
		$(".chart").css("display", "block");
		db.transaction(function (transaction) {
			var sql = "SELECT * FROM warga WHERE id_masjid='" + namaMasjid + "'";
			transaction.executeSql(
				sql,
				[],
				function (transaction, results) {
					let len = results.rows.length,
						i;
					for (i = 0; i < len; i++) {
						listRT.push(results.rows.item(i).RT);
					}
					listRT.sort((a, b) => {
						if (a > b) return 1;
						if (a < b) return -1;
						return 0;
					});

					const terbesar = listRT[listRT.length - 1];
					const totalRT = new Array(terbesar);
					let j = 0;
					for (let i = 0; i < terbesar; i++) {
						totalRT[i] = 0;
					}
					for (let i = 0; i < terbesar; ) {
						while (true) {
							if (listRT[j] == i + 1) {
								totalRT[i]++;
								j++;
							} else {
								i++;
								break;
							}
						}
					}
					// console.log("total RT");
					// console.log(totalRT);
					for (let i = 0; i < totalRT.length; i++) {
						if (totalRT[i] === 0) {
							totalRT.splice(i, 1);
						}
					}
					for (let i = 0; i < totalRT.length; i++) {
						if (totalRT[i] === 0) {
							totalRT.splice(i, 1);
						}
					}
					let uniqueList = [...new Set(listRT)];
					const chartObj = {};
					uniqueList.forEach((element, index) => {
						chartObj[`RT ${element}`] = totalRT[index];
					});
					myChart(chartObj);
				},
				null
			);
		});
	});

	alwaysCreateEntity();
	/* make side menu show up */
	$(".trigger").click(function () {
		$(".menuWrap").fadeIn(180);
		$(".menu").animate({ opacity: "1", left: "0px" }, 180);
	});

	/* make config menu show up */
	$(".cn").click(function () {
		$(".config").animate({ opacity: "1", right: "0px" }, 180);
		/* hide others */
		$(".menuWrap").fadeOut(180);
		$(".menu").animate({ opacity: "0", left: "-320px" }, 180);
	});

	//This also hide everything, but when people press ESC
	$(document).keydown(function (esc) {
		if (esc.keyCode == 27) {
			$(".menuWrap").fadeOut(180);
			$(".menu").animate({ opacity: "0", left: "-320px" }, 180);
			$(".config").animate({ opacity: "0", right: "-200vw" }, 180);
		}
	});

	$(".rightPanel").click(function () {
		$(".menuWrap").fadeOut(180);
		$(".menu").animate({ opacity: "0", left: "-320px" }, 180);
	});

	$(".rightPanel, .leftPanel").click(function () {
		$(".config").animate({ opacity: "0", right: "-200vw" }, 180);
	});

	$(".leftPanel").mouseenter(function () {
		$("#createEntity").animate({ opacity: "1", bottom: "20px" }, 180);
	});

	$(".leftPanel").mouseleave(function () {
		$("#createEntity").animate({ opacity: "0", bottom: "-70px" }, 180);
	});

	/* small conversation menu */
	$(".otherOptions").click(function () {
		$(".moreMenu").slideToggle("fast");
	});

	/* clicking the search button from the conversation focus the search bar outside it, as on desktop */
	$(".search").click(function () {
		$(".searchChats").focus();
	});

	$(".lo").click(function () {
		localStorage.clear();
		window.location.href = "./signin/index.html";
	});

	$("#createEntity").click(function () {
		$(".titleList").children().remove();
		// let nama = swal({
		//     title: "Nama Masjid",
		//     content: "input",
		//     buttons: ["Cancel", "OK"],
		// }).then((value) => {
		//     console.log(value);
		//     return value;
		// });
		// let alamat = swal({
		//     title: "Alamat Masjid",
		//     content: "input",
		//     buttons: ["Cancel", "OK"],
		// }).then((value) => {
		//     console.log(value);
		//     return value;
		// });
		let nama = prompt("Masukkan nama Masjid");
		let alamat = prompt("Masukkan alamat Masjid");
		if (nama && alamat) {
			insertDatabase(nama, alamat);
		} else {
			alwaysCreateEntity();
		}
	});
});

function insertDatabase(nama, alamat) {
	db.transaction(function (transaction) {
		let sql =
			"INSERT INTO masjid (id_user, nama_masjid, alamat_masjid) VALUES (?, ?, ?)";
		transaction.executeSql(
			sql,
			[username, nama, alamat],
			function () {
				// $(".titleList").children().remove();
			},
			function (transaction, err) {
				alert(err.message);
			}
		);
		alwaysCreateEntity();
	});
}

function alwaysCreateEntity() {
	// $(".titleList").children().remove();
	db.transaction(function (transaction) {
		let sql = "SELECT * FROM masjid WHERE id_user = '" + username + "'";
		transaction.executeSql(
			sql,
			undefined,
			function (transaction, results) {
				if (results.rows.length) {
					for (let i = 0; i < results.rows.length; i++) {
						let result = results.rows[i];
						let nama = result.nama_masjid;
						let alamat = result.alamat_masjid;
						createEntity(nama, alamat);
					}
				} else {
					$(".titleList").append(noDataFound);
				}
			},
			function (transaction, err) {
				console.log(err.message);
			}
		);
	});
}

function openData(evt, namaData) {
	// $(".dataSect").css("display", "none");
	// console.log(evt);
	$(".listButton").removeClass(" active");
	evt.currentTarget.className += " active";
	$(".newDataSect").css("display", "none");
	document.getElementById(namaData).style.display = "block";
	localStorage.removeItem("namaMasjid");
	localStorage.setItem("namaMasjid", namaData);
	loadData();
}

function createEntity(name, alamat) {
	let id = name
		.split("")
		.filter((e) => e.trim().length)
		.join("");
	let listButton = createListButton(id, name, alamat);
	$(".titleList").append(listButton);

	let newDataSect = createNewDataSect(id, name, alamat);
	$(".rightPanel").append(newDataSect);
	$(`#${id}`).css("display", "none");
}

function createListButton(id, name, alamat) {
	return (
		`<div onClick="openData(event, '${id}')" class="listButton">` +
		'<div class="listInfo">' +
		'<div class="image"></div>' +
		`<p class="name">${name}</p>` +
		`<p class="alamat">${alamat}</p>` +
		"</div>" +
		"</div>"
	);
}

function createNewDataSect(id, name, alamat) {
	return (
		`<section id="${id}" class="newDataSect">` +
		'<div class="topBar">' +
		'<div class="leftSide">' +
		`<p class="nama">${name}</p>` +
		`<p class="alamat">${alamat}</p>` +
		"</div></div>" +
		'<div class="data userBg">' +
		'<div class="container">' +
		input() +
		grid() +
		button() +
		searchFilt() +
		tabel() +
		"</div></div></section>"
	);
}

function search() {
	const searchTitle = $("#searchTitle").val().toUpperCase();
	const titleList = document.getElementById("titleList");
	const listButton = document.querySelectorAll(".listButton");
	const listName = titleList.getElementsByClassName("name");
	const listAddress = titleList.getElementsByClassName("alamat");
	// const noListButtonFound = document.querySelectorAll(".listButton[style='display: block;']");

	for (let i = 0; i < listName.length; i++) {
		let name = listName[i].innerHTML.toUpperCase();
		let address = listAddress[i].innerHTML.toUpperCase();
		if (name.indexOf(searchTitle) > -1 || address.indexOf(searchTitle) > -1) {
			listButton[i].style.display = "block";
		} else {
			listButton[i].style.display = "none";
		}
	}
	// if(noListButtonFound.length == 0){
	//     $(".titleList").append(noDataFound);
	// }
}

function input() {
	return (
		'<div class="row"> <form>' +
		'<label for="personName">Person Name</label>' +
		'<input type="text" class="personName form-control" name="" id="personName" />' +
		'<label for="address">Address</label>' +
		'<input type="text" class="address form-control" name="" id="address" />' +
		'<label for="RT">RT</label>' +
		'<input type="number" class="RT form-control" min="1" name="" id="RT" />' +
		'<label for="total">Amount of Contribute</label>' +
		'<input type="number" class="total form-control" min="1" name="" id="total"/>' +
		"</form>"
	);
}

function grid() {
	return (
		'<div class="d-grid">' +
		'<button type="button" class="insert btn btn-primary" id="insert">Insert</button>' +
		'<button type="button" class="update btn btn-primary" id="update" onclick="renew()" style="display: none">Update</button>' +
		'<br /><button type="button" class="cancel btn btn-danger" id="cancel" style="display: none">Cancel</button>' +
		"</div></div>"
	);
}

function button() {
	return (
		'<div class="dropdown">' + 
		'<button class="delete btn btn-danger" id="delete">Delete All Data</button>'+
		'<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">Export Table</button>' +
		'<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">' +
		  '<li><a class="dropdown-item" onclick="exportPdf()" href="#">To PDF</a></li>' +
		  '<li><a class="dropdown-item" onclick="exportExcel()" href="#">To Excel</a></li>' +
		'</ul></div>'
	);
}

function searchFilt() {
	return (
		'<div style="float: right;">' +
            '<span>Filter by RT</span>' +
            '<select name="" id="listRT" onchange="filterRT()"></select>' +
        '</div>' +
        '<input type="text" id="myInput" onkeyup="searchTable()" placeholder= "Search for names.."></input>'
	);
}

function tabel() {
	return (
		'<table class="table table-bordered table-striped table-hover" id="tableData">' +
		'<thead><tr style="text-align: center">' +
		"<th>No</th><th>Person Name</th><th>Address</th><th>RT</th>" +
		"<th>Amount of Contribute</th><th>Actions</th></tr>" +
		'</thead><tbody class="tablejil"></tbody></table>'+
		'<button id="showData" type="button">Show Percentage</button>'				
	);
}

const noDataFound =
	"<div id='noDataFound' class='no-hover'>" +
	'<div class="listInfo">' +
	`<p class="name">NO DATA FOUND</p>` +
	"</div>" +
	"</div>";

//CRUD
function loadData() {
	$(`#${localStorage.getItem("namaMasjid")} .tablejil`)
		.children()
		.remove();
	db.transaction(function (transaction) {
		let namaMasjid = localStorage.getItem("namaMasjid");
		var sql =
			"SELECT * FROM warga WHERE id_masjid = '" +
			namaMasjid +
			"' ORDER BY id ASC";
		// var sql = "SELECT * FROM warga ORDER BY id ASC";
		transaction.executeSql(
			sql,
			undefined,
			function (transaction, result) {
				//console.log(result.rows);
				if (result.rows.length) {
					for (var i = 0; i < result.rows.length; i++) {
						var row = result.rows.item(i);
						var id = i + 1;
						var personName = row.nama_warga;
						var address = row.alamat_warga;
						var RT = row.RT;
						var total = row.total_kontribusi;
						var btnEdit =
							'<button class="btn btn-warning btn-edit"   onclick="edit(' +
							id +
							')">Edit</button>';
						var btnDelete =
							'<button class="btn btn-danger btn-edit"  onclick="wipe(' +
							id +
							')">Delete</button>';
						$(`#${localStorage.getItem("namaMasjid")} .tablejil`).append(
							"<tr><td>" +
								id +
								"</td><td>" +
								personName +
								"</td><td>" +
								address +
								"</td><td>" +
								RT +
								'</td><td align = "center">' +
								total +
								"</td>" +
								'</td><td align = "center">' +
								btnEdit +
								" " +
								btnDelete +
								"</td></tr>"
						);
					}
				} else {
					$(`#${localStorage.getItem("namaMasjid")} .tablejil`).append(
						'<tr><td colspan="6" align="center">No Data Found</tr></td>'
					);
				}
			},
			function (transaction, error) {
				console.log(error.message);
			}
		);
	});
	showList();
}

function showList() {
	db.transaction(function (transaction) {
		const namaMasjid = localStorage.getItem("namaMasjid");
		var sql = "SELECT * FROM warga WHERE id_masjid = '" + namaMasjid + "'";
		transaction.executeSql(
			sql,
			[],
			function (transaction, results) {
				let len = results.rows.length,
					i;
				let temp = new Array();
				$(`#${namaMasjid} #listRT`).html("");
				for (i = 0; i < len; i++) {
					temp[i] = results.rows.item(i).RT;
				}
				let uniqueTemp = [...new Set(temp)];
				uniqueTemp.sort((a, b) => {
					if (a > b) return 1;
					if (a < b) return -1;
					return 0;
				});
				$(`#${namaMasjid} #listRT`).append(
					'<option value="0" onchange="filterRT()">Show All</option>'
				);
				for (i = 0; i < uniqueTemp.length; i++) {
					$(`#${namaMasjid} #listRT`).append(
						"<option value=" + uniqueTemp[i] + ">" + uniqueTemp[i] + "</option>"
					);
				}
			},
			null
		);
	});
}

function filterRT() {
	const namaMasjid = localStorage.getItem("namaMasjid");
	let rtValue = $(`#${namaMasjid} #listRT`).val();
	$(`#${localStorage.getItem("namaMasjid")} .tablejil`)
		.children()
		.remove();
	db.transaction(function (transaction) {
		var sql =
			"SELECT * FROM warga WHERE RT=" +
			rtValue +
			" AND id_masjid = '" +
			namaMasjid +
			"'";
		transaction.executeSql(sql, [], function (transaction, result) {
			if (rtValue == 0) return loadData();
			if (result.rows.length) {
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					var id = row.id;
					var personName = row.nama_warga;
					var address = row.alamat_warga;
					var RT = row.RT;
					var total = row.total_kontribusi;
					var btnEdit =
						'<button class="btn-edit btn btn-warning"   id="btn-edit" onclick="edit(' +
						id +
						')">Edit</button>';
					var btnDelete =
						'<button class="btn btn-danger"  onclick="wipe(' +
						id +
						')">Delete</button>';
					$(`#${localStorage.getItem("namaMasjid")} .tablejil`).append(
						"<tr><td>" +
							id +
							"</td><td>" +
							personName +
							"</td><td>" +
							address +
							"</td><td>" +
							RT +
							'</td><td align = "center">' +
							total +
							"</td>" +
							'</td><td align = "center">' +
							btnEdit +
							" " +
							btnDelete +
							"</td></tr>"
					);
				}
			} else {
				$(`#${localStorage.getItem("namaMasjid")} .tablejil`).append(
					'<tr><td colspan="6" align="center">No Data Found</tr></td>'
				);
			}
		});
	});
}

function edit(id) {
	swal({
		title: "Are you sure want to edit ?",
		icon: "warning",
		buttons: true,
		dangerMode: true,
	}).then((willEdit) => {
		if (!willEdit) {
			return;
		} else {
			db.transaction(function (transaction) {
				var sql = "SELECT * FROM warga WHERE id=" + id;
				transaction.executeSql(sql, [], function (transaction, results) {
					$("#personName").val(results.rows.item(0).nama_warga);
					$("#address").val(results.rows.item(0).alamat_warga);
					$("#RT").val(results.rows.item(0).RT);
					$("#total").val(results.rows.item(0).total_kontribusi);
				});
			});
			$("#insert").hide();
			$("#update").show();
			$("#cancel").show();
			window.idValue = id;
		}
	});
}

function renew() {
	var id = window.idValue;
	var personName = $("#personName").val();
	var address = $("#address").val();
	var RT = $("#RT").val();
	var total = $("#total").val();

	if (personName == "" || address == "" || RT == "" || total == "") {
		return alert("FIELD CANNOT BE EMPTY");
	}
	if (RT == "0" || total == "0") {
		return alert("Value must be greater than or equal to 1");
	}

	if (RT == "") RT = "NULL";
	if (total == "") total = "NULL";

	db.transaction(function (transaction) {
		var sql =
			"UPDATE warga SET nama_warga ='" +
			personName +
			"',alamat_warga ='" +
			address +
			"',RT =" +
			RT +
			",total_kontribusi =" +
			total +
			" WHERE id =" +
			id +
			"";
		transaction.executeSql(sql, undefined);
	});
	$("#update").hide();
	$("#cancel").hide();
	$("#insert").show();
	$("#personName").val("");
	$("#address").val("");
	$("#RT").val("");
	$("#total").val("");
	loadData();
}

function wipe(id) {
	swal({
		title: "Are you sure want to delete?",
		text: "Once deleted, you will not be able to recover this selected data!",
		icon: "warning",
		buttons: true,
		dangerMode: true,
	}).then((willDelete) => {
		if (!willDelete) {
			return;
		} else {
			db.transaction(function (transaction) {
				var sql = "DELETE FROM warga WHERE id =" + id;
				transaction.executeSql(sql, undefined);
			});
			loadData();
			swal("Poof! Your selected data has been deleted!", {
				icon: "success",
			});
		}
	});
}

function exportPdf() {
	html2canvas(document.getElementById('tableData'), {
		onrendered: function (canvas) {
			var data = canvas.toDataURL();
			var docDefinition = {
				content: [{
					image: data,
					width: 500
				}]
			};
			pdfMake.createPdf(docDefinition).download("Table.pdf");
		}
	});
}

function exportExcel(filename = ''){
	var downloadLink;
	var dataType = 'application/vnd.ms-excel';
	var tableSelect = document.getElementById("tableData");
	var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
	
	// Specify file name
	filename = filename?filename+'.xls':'excel_data.xls';
	
	// Create download link element
	downloadLink = document.createElement("a");
	
	document.body.appendChild(downloadLink);
	
	if(navigator.msSaveOrOpenBlob){
		var blob = new Blob(['\ufeff', tableHTML], {
			type: dataType
		});
		navigator.msSaveOrOpenBlob( blob, filename);
	}else{
		// Create a link to the file
		downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
	
		// Setting the file name
		downloadLink.download = filename;
		
		//triggering the function
		downloadLink.click();
	}
}

function searchTable() {
	// Declare variables
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("myInput");
	filter = input.value.toUpperCase();
	table = document.getElementById("tableData");
	tr = table.getElementsByTagName("tr");

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[1];
		if (td) {
		txtValue = td.textContent || td.innerText;
		if (txtValue.toUpperCase().indexOf(filter) > -1) {
			tr[i].style.display = "";
		} else {
			tr[i].style.display = "none";
		}
		}
	}
}

function myChart(response) {
	var xValues = Object.keys(response);
	var yValues = Object.values(response);

	function randomInteger(max) {
		return Math.floor(Math.random() * (max + 1));
	}

	function randomRgbColor() {
		let r = randomInteger(255);
		let g = randomInteger(255);
		let b = randomInteger(255);
		return [r, g, b];
	}

	var barColors = [];
	var borderColors = [];

	for (let i = 0; i < yValues.length; i++) {
		let color = randomRgbColor();
		let barTextColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`;
		let barBorderColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
		barColors.push(barTextColor);
		borderColors.push(barBorderColor);
	}

	new Chart("myChartPie", {
		type: "pie",
		data: {
			labels: xValues,
			datasets: [
				{
					backgroundColor: barColors,
					borderColor: borderColors,
					data: yValues,
				},
			],
		},
		options: {
			legend: { display: false },
			title: {
				display: true,
				text: "Data Kontribusi Takjil Per RT",
			},
		},
	});
}
