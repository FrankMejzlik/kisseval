
exports.construct = function(dataPack, userLevel = 10) {
  return {
    _userLevel: userLevel,
    _active_data_pack_ID: dataPack
  };
};

exports.setActieDataPack = function(obj, newValue) { obj._active_data_pack_ID = newValue; };
exports.getActiveDataPack = function (obj) { return obj._active_data_pack_ID; }

exports.setUserLevel = function (obj, newValue) { obj._userLevel = newValue; };
exports.getUserLevel = function (obj) { return obj._userLevel; }
