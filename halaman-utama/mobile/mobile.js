let db = openDatabase("db.takjil", "2.0", "Takjil DataBase", 2 * 1024 * 1024);
// module.exports = {db}
const username = localStorage.getItem("username");
const password = localStorage.getItem("password");
window.onload = function () {
	if (username == null && password == null) {
		alert("Please Login First");
		window.location.href = "../signin/index.html";
	}
	$(".myinfo .name").text(username);
};

$(document).ready(function () {
	// tabel masjid
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
				swal(err.message, {
					icon: "error",
				});
			}
		);
	});

	// tabel warga
	db.transaction(function (transaction) {
		let sql =
			"CREATE TABLE if not exists warga" +
			"(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
			"id_masjid VARVHAR(100) NOT NULL," +
			"nama_warga VARCHAR(100) NULL," +
			"alamat_warga VARCHAR(100) NULL," +
			"RT INTEGER NULL," +
			"total_kontribusi INTEGER NULL)";
		transaction.executeSql(
			sql,
			undefined,
			function () {},
			function (transaction, err) {
				swal(err.message, {
					icon: "error",
				});
			}
		);
	});

	alwaysCreateEntity();
	// loadData();
	$("#createEntity").click(function () {
		Swal.fire({
			title: "Masukkan Nama Masjid",
			input: "text",
			icon: "question",
			inputAttributes: {
				autocapitalize: "off",
			},
			showCancelButton: true,
			showCloseButton: true,
			confirmButtonText: "OK",
			showLoaderOnConfirm: true,
			allowOutsideClick: () => !Swal.isLoading(),
		}).then((result) => {
			if (result.isConfirmed) {
				let nama = result.value;
				Swal.fire({
					title: "Masukkan Alamat Masjid",
					input: "text",
					icon: "question",
					inputAttributes: {
						autocapitalize: "off",
					},
					showCancelButton: true,
					showCloseButton: true,
					confirmButtonText: "OK",
					showLoaderOnConfirm: true,
					allowOutsideClick: () => !Swal.isLoading(),
				}).then((result) => {
					if (result.isConfirmed) {
						let alamat = result.value;
						insertDatabase(nama, alamat);
						$(".titleList").children().remove();
						alwaysCreateEntity();
					}
				});
			}
		});
	});

	$(".titleList").on("click", ".listButton", function () {
		const nama_masjid = $(this).find(".name").text();
		const alamat_masjid = $(this).find(".alamat").text();
		$(".main").animate({ opacity: 0, left: "-100%" }, 200);
		$(".main .navbar").animate({ opacity: 0, left: "-100%" }, 200);
		$(".detail").animate({ opacity: 1, right: "0px" }, 200);
		$("#createEntity").css("display", "none");
		$(".detail .name").text(nama_masjid);
		$(".detail .alamat").text(alamat_masjid);
		const id = nama_masjid.replace(/\s/g, "");
		localStorage.setItem("namaMasjid", id);
		localStorage.setItem("namaMasjidStrip", nama_masjid);
		loadData();
		$(".chartTitle").html(`Data ${nama_masjid} Filter By RT`);
	});

	$(".detail .back").click(function () {
		$(".main").animate({ opacity: 1, left: "0px" }, 200);
		$(".main .navbar").animate({ opacity: 1, left: "0px" }, 200);
		$(".detail").animate({ opacity: 0, right: "-100%" }, 200);
		$("#createEntity").css("display", "block");
		localStorage.removeItem("namaMasjid");
		localStorage.removeItem("namaMasjidStrip");
		localStorage.removeItem("isShowDataChecked");
		$(".chart").css("display", "none");
		$("#showData").removeClass("mb-2");
		$("#showData").addClass(" mb-5 ");
	});

	// CRUD GOES HERE

	$("#delete").click(function () {
		swal({
			title: "Do you want to delete all data?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		}).then((willDeleteTable) => {
			if (willDeleteTable) {
				db.transaction(function (transaction) {
					const namaMasjid = localStorage.getItem("namaMasjid");
					var sql = "DELETE FROM warga WHERE id_masjid ='" + namaMasjid + "'";
					transaction.executeSql(
						sql,
						undefined,
						function () {
							swal("Poof! Your data has been deleted all!", {
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
	});

	$("#insert").click(function () {
		let personName = $("#personName").val();
		let address = $("#address").val();
		let RT = $("#RT").val();
		let total = $("#total").val();
		if (personName == "" || address == "" || RT == "" || total == "") {
			return alert("FIELD CANNOT BE EMPTY");
		}
		if (RT == "0" || total == "0") {
			return alert("Value must be greater than or equal to 1");
		}

		db.transaction(function (transaction) {
			const namaMasjid = localStorage.getItem("namaMasjid");
			let sql =
				"INSERT INTO warga (id_masjid, nama_warga, alamat_warga, RT, total_kontribusi) VALUES(?, ?, ?, ?, ?)";
			transaction.executeSql(
				sql,
				[namaMasjid, personName, address, RT, total],
				function () {
					swal("Data Has Been Inserted", {
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
		$("#personName").val("");
		$("#address").val("");
		$("#RT").val("");
		$("#total").val("");
		loadData();
	});

	$("#cancel").click(function () {
		$("#update").hide();
		$("#insert").show();
		$("#cancel").hide();
		$("#personName").val("");
		$("#address").val("");
		$("#RT").val("");
		$("#total").val("");
	});

	$("#print").click(function () {
		const namaMasjid = localStorage("namaMasjidStrip");
		const element = document.getElementById("printTemplate");
		html2pdf()
			.set({ filename: `${namaMasjid}.pdf` })
			.from(element)
			.save();
	});

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
});

function myChart(response) {
	var xValues = Object.keys(response);

	var yValues = Object.values(response);

	// console.log(xValues);
	// console.log(yValues);

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

	new Chart("myChartBar", {
		type: "bar",
		data: {
			labels: xValues,
			datasets: [
				{
					backgroundColor: barColors,
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

function loadData() {
	const namaMasjid = localStorage.getItem("namaMasjid");
	$(".tablejil").children().remove();
	db.transaction(function (transaction) {
		var sql =
			"SELECT * FROM warga WHERE id_masjid='" +
			namaMasjid +
			"' ORDER BY id ASC";
		transaction.executeSql(
			sql,
			undefined,
			function (transaction, result) {
				//console.log(result.rows);
				if (result.rows.length) {
					for (var i = 0; i < result.rows.length; i++) {
						var row = result.rows.item(i);
						var id_warga = row.id;
						var id = i + 1;
						var personName = row.nama_warga;
						var address = row.alamat_warga;
						var RT = row.RT;
						var total = row.total_kontribusi;
						var btnEdit =
							'<button class="btn btn-warning btn-edit"   onclick="edit(' +
							id_warga +
							')">Edit</button>';
						var btnDelete =
							'<button class="btn btn-danger btn-edit"  onclick="wipe(' +
							id_warga +
							')">Delete</button>';
						$(".detail .tablejil").append(
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
						$("#printTemplate .tablejil").append(
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
								"</td>"
						);
					}
				} else {
					$(".tablejil").append(
						'<tr><td colspan="6" align="center">No Data Found</tr></td>'
					);
				}
			} //, function(transaction, err){
			//     alert(err.message);}
		);
	});
	showList();
}

function showList() {
	db.transaction(function (transaction) {
		const namaMasjid = localStorage.getItem("namaMasjid");
		var sql = "SELECT * FROM warga WHERE id_masjid='" + namaMasjid + "'";
		transaction.executeSql(
			sql,
			[],
			function (transaction, results) {
				let len = results.rows.length,
					i;
				let temp = new Array();
				$("#listRT").html("");
				for (i = 0; i < len; i++) {
					temp[i] = results.rows.item(i).RT;
				}
				let uniqueTemp = [...new Set(temp)];
				uniqueTemp.sort((a, b) => {
					if (a > b) return 1;
					if (a < b) return -1;
					return 0;
				});
				$("#listRT").append(
					'<option value="0" onchange="filterRT()">Show All</option>'
				);
				for (i = 0; i < uniqueTemp.length; i++) {
					$("#listRT").append(
						"<option value=" + uniqueTemp[i] + ">" + uniqueTemp[i] + "</option>"
					);
				}
			},
			null
		);
	});
}

function filterRT() {
	let rtValue = $("#listRT").val();
	$(".tablejil").children().remove();
	db.transaction(function (transaction) {
		const namaMasjid = localStorage.getItem("namaMasjid");
		var sql =
			"SELECT * FROM warga WHERE id_masjid='" +
			namaMasjid +
			"' AND RT=" +
			rtValue;
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
					$(".tablejil").append(
						"<tr><td>" +
							(i + 1) +
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
				$(".tablejil").append(
					'<tr><td colspan="6" align="center">No Data Found</tr></td>'
				);
			}
		});
	});
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

function alwaysCreateEntity() {
	$(".titleList").children().remove();
	db.transaction(function (transaction) {
		let sql = "SELECT * FROM masjid WHERE id_user = '" + username + "'";
		transaction.executeSql(
			sql,
			undefined,
			function (transaction, results) {
				if (results.rows.length) {
					$(".titleList").children().remove();
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

// function openData(evt, namaData) {
// 	// $(".dataSect").css("display", "none");
// 	// console.log(evt);
// 	$(".listButton").removeClass(" active");
// 	evt.currentTarget.className += " active";
// 	$(".newDataSect").css("display", "none");
// 	document.getElementById(namaData).style.display = "block";
// 	localStorage.removeItem("namaMasjid");
// 	localStorage.setItem("namaMasjid", namaData);
// }

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

function createEntity(name, alamat) {
	let id = name
		.split("")
		.filter((e) => e.trim().length)
		.join("");
	let listButton = createListButton(id, name, alamat);
	$(".titleList").append(listButton);
}

function createListButton(id, name, alamat) {
	return (
		`<div class="listButton">` +
		'<div class="listInfo">' +
		'<div class="image"></div>' +
		`<p class="name">${name}</p>` +
		`<p class="alamat">${alamat}</p>` +
		"</div>" +
		"</div>"
	);
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
		transaction.executeSql(sql, undefined, function () {
			swal("Data Has Been Updated", {
				icon: "success",
			});
		});
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
				transaction.executeSql(sql, undefined, function () {
					swal("Poof! Your selected data has been deleted!", {
						icon: "success",
					});
				});
			});
			loadData();
		}
	});
}
