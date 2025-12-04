export const disposeEntity = (entity) => {
      if (entity.object3D) {
        entity.object3D.traverse((node) => {
          if (node.isMesh) {
            if (node.geometry) {
              node.geometry.dispose()
            }
            if (node.material) {
              if (Array.isArray(node.material)) {
                node.material.forEach(material => material.dispose())
              } else {
                node.material.dispose()
              }
              if (node.material.map) node.material.map.dispose()
              if (node.material.alphaMap) node.material.alphaMap.dispose()
              if (node.material.lightMap) node.material.lightMap.dispose()
              if (node.material.bumpMap) node.material.bumpMap.dispose()
              if (node.material.normalMap) node.material.normalMap.dispose()
              if (node.material.specularMap) node.material.specularMap.dispose()
              if (node.material.envMap) node.material.envMap.dispose()
            }
          }
        })
      }
      entity.remove()
    }