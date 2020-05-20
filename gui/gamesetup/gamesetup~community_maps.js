function communityMaps_patchModFilter()
{
  if (!global["getFilteredMods"])
    global["getFilteredMods"] = function(gameData) { return Engine.GetEngineInfo().mods };

  // List generated with:
  // `ls maps/random/*.js | sed -r 's/(\w|\/)+_triggers.js//g' | sed -r 's/.js//g' | sed -r '/^$/d' | paste -sd "," - | sed -r "s/,/\",\"/g" | sed -r "s/^|$/\"/g"`
  // `ls maps/{scenarios,skirmishes}/*.xml | sed -r 's/.xml//g' | sed -r '/^$/d' | paste -sd "," - | sed -r "s/,/\",\"/g" | sed -r "s/^|$/\"/g`
  if (!global["communityMaps"])
    global["communityMaps"] = [
      'maps/random/dune',
      'maps/random/fert',
      'maps/random/fert_mountain',
      'maps/random/forest_nothing',
      'maps/random/plague_swamp',
      'maps/random/riverway',
      'maps/random/volcanic_island',
      "maps/scenarios/Asian Campaign",
      "maps/scenarios/At World's End",
      "maps/scenarios/Brigantium (2)",
      "maps/scenarios/Community_Map",
      "maps/scenarios/Constantinople",
      "maps/scenarios/Cyzicus",
      "maps/scenarios/Europe 3",
      "maps/scenarios/First Battle of Numantia",
      "maps/scenarios/FirthandFourth",
      "maps/scenarios/Halicarnassus",
      "maps/scenarios/invasion_of_britain_by_KzoneDD",
      "maps/scenarios/Mesina",
      "maps/scenarios/Olimpus 4",
      "maps/scenarios/paradise_valley",
      "maps/scenarios/Qart Hadasht",
      "maps/scenarios/raiders_in_the_alps",
      "maps/scenarios/siege_of_greece",
      "maps/scenarios/Siege of Numantia",
      "maps/scenarios/South_East_Asia",
      "maps/skirmishes/Alpine_stef",
      "maps/skirmishes/Arabia (4)",
      "maps/skirmishes/battle into the dirt",
      "maps/skirmishes/Battle of Vikingland",
      "maps/skirmishes/Caribbean Island(6)",
      "maps/skirmishes/City VS City (2)",
      "maps/skirmishes/Coastline (2)",
      "maps/skirmishes/Country Side (2)",
      "maps/skirmishes/Euboea Harvest (4)",
      "maps/skirmishes/Fahrenheit (8)",
      "maps/skirmishes/Four Cities Meet (4)",
      "maps/skirmishes/Italian Peninsula (6)",
      "maps/skirmishes/Jungle Valley (2)",
      "maps/skirmishes/Lesvos Castle (2)",
      "maps/skirmishes/lonely mountain",
      "maps/skirmishes/Northern Islands (4)",
      "maps/skirmishes/Rapa Nui (Easter Island)",
      "maps/skirmishes/The Duel (2)"
    ];

  function isCommunityMap(mapName) {
    return global["communityMaps"].indexOf(mapName) > -1;
  }

  autociv_patchApplyN("getFilteredMods", function (target, that, args)
  {
  	let mod = ([name, version]) => !/^FGod.*/i.test(name);
  	return target.apply(that, args).filter(mod);
  });

  autociv_patchApplyN("getFilteredMods", function (target, that, args)
  {
  	let mod = ([name, version]) => !/^AutoCiv.*/i.test(name);
  	return target.apply(that, args).filter(mod);
  });

  autociv_patchApplyN("getFilteredMods", function (target, that, args)
  {
  	let mod = ([name, version]) => (!/^community_maps.*/i.test(name) || isCommunityMap(args[0].map));

  	return target.apply(that, args).filter(mod);
  });
  
  sendRegisterGameStanzaImmediate = function ()
  {
  	if (!g_IsController || !Engine.HasXmppClient())
  		return;
  
  	if (g_GameStanzaTimer !== undefined)
  	{
  		clearTimeout(g_GameStanzaTimer);
  		g_GameStanzaTimer = undefined;
  	}
  
  	let clients = formatClientsForStanza();
  	let stanza = {
  		"name": g_ServerName,
  		"port": g_ServerPort,
  		"hostUsername": Engine.LobbyGetNick(),
  		"mapName": g_GameAttributes.map,
  		"niceMapName": getMapDisplayName(g_GameAttributes.map),
  		"mapSize": g_GameAttributes.mapType == "random" ? g_GameAttributes.settings.Size : "Default",
  		"mapType": g_GameAttributes.mapType,
  		"victoryConditions": g_GameAttributes.settings.VictoryConditions.join(","),
  		"nbp": clients.connectedPlayers,
  		"maxnbp": g_GameAttributes.settings.PlayerData.length,
  		"players": clients.list,
  		"stunIP": g_StunEndpoint ? g_StunEndpoint.ip : "",
  		"stunPort": g_StunEndpoint ? g_StunEndpoint.port : "",
  		"mods": JSON.stringify(getFilteredMods(g_GameAttributes)) // <----- THIS CHANGES
  	};
  
  	// Only send the stanza if the relevant settings actually changed
  	if (g_LastGameStanza && Object.keys(stanza).every(prop => g_LastGameStanza[prop] == stanza[prop]))
  		return;
  
  	g_LastGameStanza = stanza;
  	Engine.SendRegisterGame(stanza);
  };
}

autociv_patchApplyN("init", function (target, that, args)
{
	target.apply(that, args);
	communityMaps_patchModFilter();
})
