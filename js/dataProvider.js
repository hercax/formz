$(function () {
	DataProvider = {};

	DataProvider.getPagesByForm = function () {
		return [
			{pageid:1,category:'General',name:'Setup'},
			{pageid:2,category:'General',name:'Application'},
			{pageid:3,category:'Credit',name:'Scores'},
			{pageid:4,category:'Credit',name:'Income'}
		];
	};	

	DataProvider.getFieldsByPage = function (pageId) {
		return  [
			{fieldid: 1,
			label: 'Nombre: ',
			value: '203'},

			{fieldid: 2,
			label: 'Estado: ',
			value: 'Michoacan',
			controltype: 'dropdown'}
		];
	}

	window.DataProvider = DataProvider;
});