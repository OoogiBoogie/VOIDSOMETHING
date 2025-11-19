"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { CITY_BOUNDS, buildingColliders } from "@/lib/city-assets"
import { worldEvents, PLAYER_MOVED, PARCEL_ENTERED, PARCEL_EXITED, DISTRICT_ENTERED } from "@/services/events/worldEvents"
import { getParcelInfo, isSameParcel } from "@/world/WorldCoords"

interface PlayerCharacter3DProps {
  position: { x: number; y: number; z: number }
  onMove: (pos: { x: number; y: number; z: number }) => void
  onRotationChange?: (rotationY: number) => void
  onCameraAngleChange?: (angle: "close" | "medium" | "far") => void
  controlsEnabled?: boolean
  mobileMovement?: { x: number; z: number }
  mobileSprinting?: boolean
  isMobile?: boolean // Added device type flag
}

type AnimState = "idle" | "walking" | "running"
type CameraAngle = "close" | "medium" | "far"

const CAMERA_CONFIGS = {
  close: { distance: 5, height: 2, sideOffset: 1 },
  medium: { distance: 8, height: 3, sideOffset: 1.5 },
  far: { distance: 12, height: 4, sideOffset: 2 },
}

function clampToWorld(pos: { x: number; z: number }) {
  return {
    x: THREE.MathUtils.clamp(pos.x, CITY_BOUNDS.minX, CITY_BOUNDS.maxX),
    z: THREE.MathUtils.clamp(pos.z, CITY_BOUNDS.minZ, CITY_BOUNDS.maxZ),
  }
}

function collides(pos: { x: number; z: number }) {
  const colliders = buildingColliders()
  const PLAYER_RADIUS = 0.6

  for (const col of colliders) {
    const closestX = THREE.MathUtils.clamp(pos.x, col.x - col.width / 2, col.x + col.width / 2)
    const closestZ = THREE.MathUtils.clamp(pos.z, col.z - col.depth / 2, col.z + col.depth / 2)

    const dx = pos.x - closestX
    const dz = pos.z - closestZ
    const distSq = dx * dx + dz * dz

    if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
      return true
    }
  }
  return false
}

function CharacterModel({ animState }: { animState: AnimState }) {
  const groupRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const timeRef = useRef(0)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)

  useEffect(() => {
    const loader = new GLTFLoader()

    loader.load(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/character_walking-iPo5HCxKF3uY8QsXyh2kpBKfKGMur0.glb",
      (gltf) => {
        const loadedModel = gltf.scene

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(loadedModel)
          mixerRef.current = mixer

          const walkAnim =
            gltf.animations.find(
              (anim) =>
                anim.name.toLowerCase().includes("walk") ||
                anim.name.toLowerCase().includes("run") ||
                anim.name.toLowerCase().includes("move"),
            ) || gltf.animations[0]

          if (walkAnim) {
            const action = mixer.clipAction(walkAnim)
            action.play()
          }
        }

        setModel(loadedModel)
      },
      () => {},
      (error) => {
        console.error("Error loading GLB:", error)
        createProceduralCharacter()
      },
    )

    function createProceduralCharacter() {
      const characterGroup = new THREE.Group()

      const headGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75)
      const headMat = new THREE.MeshStandardMaterial({
        color: "#06FFA5",
        emissive: "#06FFA5",
        emissiveIntensity: 0.5,
      })
      const head = new THREE.Mesh(headGeo, headMat)
      head.position.set(0, 3.0, 0)
      characterGroup.add(head)

      const bodyGeo = new THREE.BoxGeometry(1.125, 1.5, 0.5625)
      const bodyMat = new THREE.MeshStandardMaterial({
        color: "#38BDF8",
        emissive: "#38BDF8",
        emissiveIntensity: 0.4,
      })
      const body = new THREE.Mesh(bodyGeo, bodyMat)
      body.position.set(0, 1.875, 0)
      characterGroup.add(body)

      const armGeo = new THREE.BoxGeometry(0.375, 1.125, 0.375)
      const armMat = new THREE.MeshStandardMaterial({
        color: "#38BDF8",
        emissive: "#38BDF8",
        emissiveIntensity: 0.2,
      })

      const leftArm = new THREE.Mesh(armGeo, armMat)
      leftArm.position.set(-0.75, 2.25, 0)
      leftArm.name = "leftArm"
      characterGroup.add(leftArm)

      const rightArm = new THREE.Mesh(armGeo, armMat)
      rightArm.position.set(0.75, 2.25, 0)
      rightArm.name = "rightArm"
      characterGroup.add(rightArm)

      const legGeo = new THREE.BoxGeometry(0.375, 1.5, 0.375)
      const legMat = new THREE.MeshStandardMaterial({
        color: "#10b981",
        emissive: "#10b981",
        emissiveIntensity: 0.2,
      })

      const leftLeg = new THREE.Mesh(legGeo, legMat)
      leftLeg.position.set(-0.285, 0.75, 0)
      leftLeg.name = "leftLeg"
      characterGroup.add(leftLeg)

      const rightLeg = new THREE.Mesh(legGeo, legMat)
      rightLeg.position.set(0.285, 0.75, 0)
      rightLeg.name = "rightLeg"
      characterGroup.add(rightLeg)

      setModel(characterGroup)
    }
  }, [])

  useFrame((_, delta) => {
    if (!model) return

    if (mixerRef.current) {
      const speed = animState === "running" ? 1.5 : animState === "walking" ? 1.0 : 0
      mixerRef.current.timeScale = speed
      mixerRef.current.update(delta)
    } else {
      const speed = animState === "running" ? 10 : animState === "walking" ? 6 : 0
      timeRef.current += delta * speed

      const leftLeg = model.getObjectByName("leftLeg")
      const rightLeg = model.getObjectByName("rightLeg")
      const leftArm = model.getObjectByName("leftArm")
      const rightArm = model.getObjectByName("rightArm")

      if (animState !== "idle" && leftLeg && rightLeg) {
        leftLeg.rotation.x = Math.sin(timeRef.current) * 0.6
        rightLeg.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.6

        if (leftArm && rightArm) {
          leftArm.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.4
          rightArm.rotation.x = Math.sin(timeRef.current) * 0.4
        }
      } else {
        if (leftLeg) leftLeg.rotation.x = 0
        if (rightLeg) rightLeg.rotation.x = 0
        if (leftArm) leftArm.rotation.x = 0
        if (rightArm) rightArm.rotation.x = 0
      }
    }
  })

  if (!model) return null

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  )
}

export function PlayerCharacter3D({
  position,
  onMove,
  onRotationChange,
  onCameraAngleChange,
  controlsEnabled = true,
  mobileMovement,
  mobileSprinting,
  isMobile = false, // Added with default false
}: PlayerCharacter3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const shadowRef = useRef<THREE.Mesh>(null)

  const [cameraAngle, setCameraAngle] = useState<CameraAngle>("medium")

  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  })
  const [animState, setAnimState] = useState<AnimState>("idle")

  const localPosRef = useRef({ x: position.x, y: position.y, z: position.z })
  const { camera } = useThree()

  const characterRotationRef = useRef(0)
  
  // Track current parcel for event emission
  const currentParcelIdRef = useRef<number | null>(null)
  const currentDistrictRef = useRef<string | null>(null)

  // Handle external position changes (e.g., UI teleport from PlayerPositionContext)
  useEffect(() => {
    const externalPos = { x: position.x, y: position.y, z: position.z };
    const currentPos = localPosRef.current;
    
    // Check if position changed externally (teleport)
    const distSq = 
      (externalPos.x - currentPos.x) ** 2 + 
      (externalPos.z - currentPos.z) ** 2;
    
    // If position changed significantly (>0.5 units), it's a teleport
    if (distSq > 0.25) {
      console.log('[PlayerCharacter3D] Teleport detected:', externalPos);
      localPosRef.current = externalPos;
      
      // Update visual position immediately
      if (groupRef.current) {
        groupRef.current.position.set(externalPos.x, externalPos.y, externalPos.z);
      }
      
      // Emit world events for parcel/district change
      const parcelInfo = getParcelInfo({ x: externalPos.x, z: externalPos.z });
      
      if (currentParcelIdRef.current !== parcelInfo.id) {
        if (currentParcelIdRef.current !== null) {
          worldEvents.emit(PARCEL_EXITED, {
            parcelId: currentParcelIdRef.current,
            newParcelId: parcelInfo.id,
            timestamp: Date.now(),
          });
        }
        
        worldEvents.emit(PARCEL_ENTERED, {
          parcelInfo,
          previousParcelId: currentParcelIdRef.current,
          timestamp: Date.now(),
        });
        
        currentParcelIdRef.current = parcelInfo.id;
      }
      
      if (currentDistrictRef.current !== parcelInfo.district) {
        worldEvents.emit(DISTRICT_ENTERED, {
          district: parcelInfo.district,
          parcelId: parcelInfo.id,
          timestamp: Date.now(),
        });
        
        currentDistrictRef.current = parcelInfo.district;
      }
    }
  }, [position.x, position.y, position.z]);

  useEffect(() => {
    if (!controlsEnabled) {
      keys.current = { w: false, a: false, s: false, d: false, shift: false }
      setAnimState("idle")
      return
    }

    if (isMobile) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === "w") keys.current.w = true
      if (key === "a") keys.current.a = true
      if (key === "s") keys.current.s = true
      if (key === "d") keys.current.d = true
      if (key === "shift") keys.current.shift = true

      if (key === "v") {
        e.preventDefault()
        setCameraAngle((prev) => {
          const next = prev === "close" ? "medium" : prev === "medium" ? "far" : "close"
          onCameraAngleChange?.(next)
          return next
        })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === "w") keys.current.w = false
      if (key === "a") keys.current.a = false
      if (key === "s") keys.current.s = false
      if (key === "d") keys.current.d = false
      if (key === "shift") keys.current.shift = false
    }

    const handleBlur = () => {
      keys.current = { w: false, a: false, s: false, d: false, shift: false }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("blur", handleBlur)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("blur", handleBlur)
    }
  }, [controlsEnabled, isMobile, onCameraAngleChange]) // Added isMobile dependency

  useFrame((_, delta) => {
    if (!groupRef.current || !controlsEnabled) return

    const ROTATION_SPEED = isMobile ? 5.0 : 4.0 // Optimized rotation speed for smoother mobile turning

    if (!isMobile) {
      if (keys.current.a) {
        characterRotationRef.current += ROTATION_SPEED * delta
      }
      if (keys.current.d) {
        characterRotationRef.current -= ROTATION_SPEED * delta
      }
    }

    groupRef.current.rotation.y = characterRotationRef.current
    onRotationChange?.(characterRotationRef.current)

    const hasKeyboardMovement = !isMobile && (keys.current.w || keys.current.s)
    const hasMobileMovement =
      isMobile && mobileMovement && (Math.abs(mobileMovement.x) > 0.05 || Math.abs(mobileMovement.z) > 0.05) // Reduced threshold from 0.1 to 0.05 for better responsiveness
    const hasMovement = hasKeyboardMovement || hasMobileMovement

    if (!hasMovement) {
      if (animState !== "idle") setAnimState("idle")
    } else {
      let moveDir: THREE.Vector3
      let moveMagnitude = 1.0

      if (hasMobileMovement && mobileMovement) {
        moveMagnitude = Math.sqrt(mobileMovement.x * mobileMovement.x + mobileMovement.z * mobileMovement.z)
        moveMagnitude = Math.min(moveMagnitude, 1.0) // Clamp to max 1.0

        const angle = Math.atan2(mobileMovement.x, mobileMovement.z)
        characterRotationRef.current = angle
        groupRef.current.rotation.y = angle
        onRotationChange?.(angle)

        moveDir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle))
      } else {
        const forward = keys.current.w ? 1 : keys.current.s ? -1 : 0
        moveDir = new THREE.Vector3(
          Math.sin(characterRotationRef.current) * forward,
          0,
          Math.cos(characterRotationRef.current) * forward,
        )
      }

      const WALK_SPEED = isMobile ? 14 : 12 // Slightly faster on mobile
      const RUN_SPEED = isMobile ? 22 : 20
      const isSprinting = keys.current.shift || mobileSprinting
      const baseSpeed = isSprinting ? RUN_SPEED : WALK_SPEED

      const step = baseSpeed * delta * moveMagnitude

      let candidate = {
        x: localPosRef.current.x + moveDir.x * step,
        y: 0,
        z: localPosRef.current.z + moveDir.z * step,
      }

      const clamped = clampToWorld({ x: candidate.x, z: candidate.z })
      candidate.x = clamped.x
      candidate.z = clamped.z

      if (collides({ x: candidate.x, z: candidate.z })) {
        const slideX = { x: candidate.x, z: localPosRef.current.z }
        if (!collides(slideX)) {
          candidate.z = localPosRef.current.z
        } else {
          const slideZ = { x: localPosRef.current.x, z: candidate.z }
          if (!collides(slideZ)) {
            candidate.x = localPosRef.current.x
          } else {
            candidate = { x: localPosRef.current.x, y: 0, z: localPosRef.current.z }
          }
        }
      }

      localPosRef.current = candidate
      onMove(candidate)
      groupRef.current.position.set(candidate.x, candidate.y, candidate.z)

      const nextState: AnimState = baseSpeed > WALK_SPEED + 0.01 ? "running" : "walking"
      if (nextState !== animState) setAnimState(nextState)
      
      // Emit world events for HUD synchronization
      const parcelInfo = getParcelInfo({ x: candidate.x, z: candidate.z })
      
      // Always emit PLAYER_MOVED
      worldEvents.emit(PLAYER_MOVED, {
        position: { x: candidate.x, z: candidate.z },
        parcelId: parcelInfo.id,
        timestamp: Date.now(),
      })
      
      // Emit PARCEL_ENTERED/EXITED when crossing parcel boundaries
      if (currentParcelIdRef.current !== parcelInfo.id) {
        if (currentParcelIdRef.current !== null) {
          worldEvents.emit(PARCEL_EXITED, {
            parcelId: currentParcelIdRef.current,
            newParcelId: parcelInfo.id,
            timestamp: Date.now(),
          })
        }
        
        worldEvents.emit(PARCEL_ENTERED, {
          parcelInfo,
          previousParcelId: currentParcelIdRef.current,
          timestamp: Date.now(),
        })
        
        currentParcelIdRef.current = parcelInfo.id
      }
      
      // Emit DISTRICT_ENTERED when entering new district
      if (currentDistrictRef.current !== parcelInfo.district) {
        worldEvents.emit(DISTRICT_ENTERED, {
          district: parcelInfo.district,
          parcelId: parcelInfo.id,
          timestamp: Date.now(),
        })
        
        currentDistrictRef.current = parcelInfo.district
      }
    }

    const config = CAMERA_CONFIGS[cameraAngle]
    const playerPos = groupRef.current.position
    const playerRot = characterRotationRef.current

    const offsetX = Math.sin(playerRot) * config.distance + Math.cos(playerRot) * config.sideOffset
    const offsetZ = Math.cos(playerRot) * config.distance - Math.sin(playerRot) * config.sideOffset

    const targetCamPos = new THREE.Vector3(playerPos.x - offsetX, playerPos.y + config.height, playerPos.z - offsetZ)

    const cameraLerpSpeed = isMobile ? 0.4 : 0.3
    camera.position.lerp(targetCamPos, cameraLerpSpeed)

    const lookAtTarget = new THREE.Vector3(playerPos.x, playerPos.y + 1.5, playerPos.z)
    camera.lookAt(lookAtTarget)
  })

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]} scale={1.5} castShadow renderOrder={1}>
      <mesh ref={shadowRef} position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.0, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      <CharacterModel animState={animState} />

      <pointLight color={"#38BDF8"} intensity={1.4} distance={10} decay={2} position={[0, 1.4, 0]} />
      <pointLight color={"#06FFA5"} intensity={2.0} distance={12} decay={2} position={[0, 2, 0]} />
    </group>
  )
}
