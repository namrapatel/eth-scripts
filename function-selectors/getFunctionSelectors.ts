import { BytesLike, isBytesLike } from "@ethersproject/bytes";

const args = process.argv.slice(2);
if(args.length != 1) {
    console.log(`please supply the correct parameters:
      metadata
    `)
    process.exit(1);
  }

let facetName = args[0];

var dungeonFacetFunctionSelectors: BytesLike[] = [];
var configFacetFunctionSelectors: BytesLike[] = [];
var getterFacetFunctionSelectors: BytesLike[] = [];
var creaturesFacetFunctionSelectors: BytesLike[] = [];
var impersonationFacetFunctionSelectors: BytesLike[] = [];

const ethers = require('ethers');
const fs = require('fs')

function getFunctionSelectors(obj: any, facetFunctionSelectors: BytesLike[]) {
    var facetCount = Object.keys(obj.abi).length;
    for (var i = 0; i < facetCount; i++) {
      if(obj.abi[i].type === "function") {
        const functionName = obj.abi[i].name
        var functionInputs: any[] = []
        var firstTuple: any[] = []
        var secondTuple: any[] = []
        var wasTuple: boolean = false
        var tupleCounter = 0
        // loop through and read inputs for each function
        for(var j=0; j<obj.abi[i].inputs.length; j++){
          var input = obj.abi[i].inputs[j].type

          // if input is a tuple, read the tuple
          if(input === "tuple"){
            wasTuple = true
            for(var k=0; k<obj.abi[i].inputs[j].components.length; k++){
              var firstTupleInput = obj.abi[i].inputs[j].components[k].type
              
              // if tuple's input is a tuple, read the nested tuple
              if (firstTupleInput === "tuple") {
                tupleCounter++
                for (var l = 0; l < obj.abi[i].inputs[j].components[k].components.length; l++) {
                  var secondTupleInput = obj.abi[i].inputs[j].components[k].components[l].internalType
                  secondTuple.push(secondTupleInput)
                }
                firstTuple.push(secondTuple)
                secondTuple = []
              } else { 
                firstTuple.push(firstTupleInput)
              }
            }
            functionInputs.push(firstTuple)
            firstTuple = []
          } else {
            functionInputs.push(input)
          }
         
        if (wasTuple) {
          var iter = 0
          while(functionInputs[0][iter] !== undefined) {
            if (tupleCounter !== 0) {
              var string = "(" + functionInputs[0][iter].toString() + ")"
              functionInputs[0][iter] = string
              iter++;
              tupleCounter--;
            } else {
              var string1 = functionInputs[0][iter].toString()
              functionInputs[0][iter] = string1
              iter++;
            }
            
          }
          var string2 = "(" + functionInputs.toString() + ")"
          var functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${functionName}(${string2})`)).slice(0, 10)
        }
      }
        if (!wasTuple) {
          var functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${functionName}(${functionInputs})`)).slice(0, 10)
        }
        facetFunctionSelectors.push(functionSelector)
      }
  }
          var encoded = ethers.utils.defaultAbiCoder.encode(["bytes4[]"], [facetFunctionSelectors])
          process.stdout.write(encoded);
}

fs.readFile('../client/public/abi.json', 'utf8', (err: string, abiString: string) => {
    if (err) {
        console.log("Error reading file from disk:", err)
        return
    }
    try {
        var obj = JSON.parse(abiString)
        if (facetName == "DungeonFacet"){
          obj = obj.DungeonFacet;
          getFunctionSelectors(obj, dungeonFacetFunctionSelectors)
        } else if (facetName == "CreaturesFacet") {
          obj = obj.CreaturesFacet;
          getFunctionSelectors(obj, creaturesFacetFunctionSelectors)
        } else if (facetName == "ImpersonationFacet") {
          obj = obj.ImpersonationFacet;
          getFunctionSelectors(obj, impersonationFacetFunctionSelectors)
        } else if (facetName == "ConfigFacet"){
          obj = obj.ConfigFacet;
          getFunctionSelectors(obj, configFacetFunctionSelectors)
        } else if (facetName == "GetterFacet"){
          obj = obj.GetterFacet;
          getFunctionSelectors(obj, getterFacetFunctionSelectors)
        }
  } catch(err) {  
          console.log('Error parsing JSON string:', err)
      }
  })