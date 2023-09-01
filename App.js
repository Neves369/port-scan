import { SafeAreaView, StyleSheet, FlatList, View, Text } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import React, {useState, useCallback} from 'react';
import TcpSocket from 'react-native-tcp-socket';
import { StatusBar } from 'expo-status-bar';
import sip from './utils/shift8-ip-func';
var ipaddr = require('ipaddr.js');

export default function App() {

  var portRange = [22, 80, 443];
  const [scanResult, setScanResult] = useState([]);

  var network_promise = new Promise(function(resolve, reject) {
    NetInfo.fetch().then(state => { 
      local_ip = state.details.ipAddress; 
      local_netmask = state.details.subnet;

      subconv = ipaddr.IPv4.parse(local_netmask).prefixLengthFromSubnetMask();
      firstHost = ipaddr.IPv4.networkAddressFromCIDR(local_ip + "/" + subconv);
      lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(local_ip + "/" + subconv);
      firstHostHex = sip.convertIPtoHex(firstHost);
      lastHostHex = sip.convertIPtoHex(lastHost);
      ipRange = sip.getIPRange(firstHostHex,lastHostHex);
      ipRange = ipRange.slice(1); // Remove o primeiro ip do array
      resolve({
        local_ip: local_ip, 
        local_netmask: local_netmask, 
        subnet_conv: subconv, 
        first_host: firstHost, 
        last_host: lastHost,
        first_host_hex: firstHostHex, 
        last_host_hex: lastHostHex, 
        ip_range: ipRange
      });

    });
  });

  // Função para verificar hosts 
  var scanHost = function(hostIP, hostPort) { 
    return new Promise(function (resolve,reject) { 
      
      const client = TcpSocket.connect(
      {
        port: hostPort,
        host: hostIP
      },
    
      function() { // 'connect' listener 
        // console.log('Connected'); 
      }); 

      client.setTimeout(2000,function(){});

      client.on('connect', function() {
        var scan_result = {
          ip:hostIP, 
          port:hostPort
        };
        resolve(scan_result);
      })

      setTimeout(function(){
        client.destroy();
      },5000);

     
    }); 
  }


  network_promise.then((response) => {
    for (let i = 0; i < response["ip_range"].length; i++) {
      for (let j = 0; j < portRange.length; j++) { 
        scanHost(response["ip_range"][i], portRange[j])
        .then(response => {
          console.log(response)
          setScanResult((scanResult)=>[...scanResult, response]);
          
          
        })
        .catch(err => {
          console.error(err);
          return err;
        })
      }
    }
  })
  .catch(err => {
    console.error(err);
    return err;
  })

  const renderItem = useCallback(({ item, index }) => {
    console.log("item: ", item)
    return (
      <View style={{width: "100%", height: 50, alignItems: "center", marginBottom: 0, flexDirection: 'row', justifyContent: "space-between"}}>
      <Text>{item.ip}</Text>
      <Text>{item.port}</Text>
      </View>
    );
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <FlatList
          data={scanResult}
          numColumns={1}
          renderItem={renderItem}
          contentContainerStyle={{
            width: "90%",
            alignSelf: "center",
          }}
        />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 100
  },
});
