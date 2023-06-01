var roomybookmarkstoolbarColor = {
	branch: null,
	onLoad: function() {
		document.getElementById("colorText").value = document.getElementById("colorTextButton").value;
		document.getElementById("colorBac").value = document.getElementById("colorBacButton").value;


		document.getElementById("title").value = window.arguments[0].inn.title;
		document.getElementById("url").value = window.arguments[0].inn.url

		var rbtdatas = {id:window.arguments[0].inn.id,}
		this.db(rbtdatas, 'getGata',  function (data) {
			if(data[0]) {
				document.getElementById("colorText").value = data[0];
				document.getElementById("colorTextButton").value = data[0];
			}
			if(data[1]) {
				document.getElementById("colorBac").value = data[1];
				document.getElementById("colorBacButton").value = data[1];
			}
		});

	},

	colorChanged: function(event, object) {
		if(event.target.type=="text") {
			if(object == 'text') {
				document.getElementById("colorTextButton").value = event.target.value;
			}
			if(object == 'background') {document.getElementById("colorBacButton").value = event.target.value;}
			if(!validateColor(event.target.value)) {
				alert('Please enter a valid HEX color')
				if(object == 'text') {document.getElementById("colorText").value = ''}
				if(object == 'background') {document.getElementById("colorBac").value = ''}
						document.getElementById("colorTextButton").value = document.getElementById("colorText").value;
						document.getElementById("colorBacButton").value = document.getElementById("colorBac").value;
			}
	}
		function validateColor(colorStr) {
		return colorStr.match(/^#[a-f0-9]{6}$/i) !== null || colorStr == '';
		}
		if(event.target.type=="color") {
			if(object == 'text') {document.getElementById("colorText").value = event.target.value;}
			if(object == 'background') {document.getElementById("colorBac").value = event.target.value;}
		}
	},

	clearColor: function() {
		document.getElementById("colorText").value = '';
		document.getElementById("colorBac").value = '';
	},

	onOk: function() {
		var rbtdata = {id:window.arguments[0].inn.id, textcolor:document.getElementById("colorText").value, backgroundcolor:document.getElementById("colorBac").value};
		if ((!rbtdata.textcolor && !rbtdata.backgroundcolor) || (rbtdata.textcolor == '' && rbtdata.backgroundcolor == '')) {
			this.db(rbtdata, 'clearColor');
			window.close();
			return;
		}
		this.db(rbtdata, 'saveData',  function () {window.close();});
	},

	deleteDB: function() {
		if (confirm('Do you want to delete all changes?')) {
			this.db('', 'deleteDB');
		}
	},

	db: function(data, DBevent, callback) {
		var thisPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
		Components.utils.import("resource://gre/modules/Services.jsm");
		Components.utils.import("resource://gre/modules/FileUtils.jsm");

		let file = FileUtils.getFile("ProfD", ["roomybookmarkstoolbar.sqlite"]);
		let dbConn = Services.storage.openDatabase(file);
		thisPrefs.getBranch('extensions.roomybookmarkstoolbar.').setBoolPref('DBcreated', true);
		dbConn.executeSimpleSQL("create table if not exists colors (id TEXT NOT NULL PRIMARY KEY, textcolor TEXT, backgroundcolor TEXT)");

		if (DBevent == 'saveData') {
			var list = new Array();
				let statement = dbConn.createStatement("SELECT * FROM colors");
				statement.executeAsync({
					handleResult: function(aResultSet) {
								for (var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
								if (row.getResultByName("id") == data.id) {
									list.push(row.getResultByName("id"))
								}
							}
					},
					handleCompletion: function(aReason) {
						if (list[0]) {
							let statement = dbConn.createStatement("UPDATE colors set textcolor = :textcolor, backgroundcolor = :backgroundcolor where id = :id");
							statement.params.id = data.id;
							statement.params.textcolor = data.textcolor;
							statement.params.backgroundcolor = data.backgroundcolor;
							statement.executeAsync({
								handleCompletion: function(aReason) {
									callback();
								}   
							});
						} else {
							let statement = dbConn.createStatement("INSERT INTO colors VALUES(:id, :textcolor, :backgroundcolor)");
							statement.params.id = data.id;
							statement.params.textcolor = data.textcolor;
							statement.params.backgroundcolor = data.backgroundcolor;
							statement.executeAsync({
								handleCompletion: function(aReason) {
									callback();
								}   
							});
						}
						try { dbConn.asyncClose();} catch(e) {} 
					}   
				});
		}

		if (DBevent == 'getGata') {
			var list = new Array();
			let statement = dbConn.createStatement("SELECT * FROM colors");
			statement.executeAsync({
				handleResult: function(aResultSet) {
					var newHistoryString = "";
						for (var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
							if (row.getResultByName("id") == data.id) {
								list.push(row.getResultByName("textcolor"))
								list.push(row.getResultByName("backgroundcolor"))
								callback(list)
							}
						}
				},
				handleCompletion: function(aReason) {
					dbConn.asyncClose();
				}   
			});
		}

		if (DBevent == 'clearColor') {
			dbConn.executeSimpleSQL(`DELETE FROM colors WHERE id = "${data.id}"`);
		}

		if (DBevent == 'deleteDB') {	
				ChromeUtils.importESModule("resource://gre/modules/FileUtils.sys.mjs");
				var thisPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
				thisPrefs.getBranch('extensions.roomybookmarkstoolbar.').setBoolPref('DBcreated', false);

				var statement = dbConn.createStatement("DELETE FROM colors");
				statement.executeAsync({
					handleCompletion: function(aReason) {
						dbConn.asyncClose();
						window.close();
					}}
				);

			}
	},
};