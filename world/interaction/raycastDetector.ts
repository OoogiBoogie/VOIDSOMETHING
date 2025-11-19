/**
 * PHASE 5.3 — RAYCAST DETECTOR
 * 
 * Raycasting utilities for detecting interactable objects.
 */

import { Raycaster, Vector3, Vector2, Camera } from "three";
import type { Object3D } from "three";
import type { RaycastHit } from "./interactionTypes";

export class RaycastDetector {
  private raycaster: Raycaster;
  private rayOrigin: Vector3;
  private rayDirection: Vector3;

  constructor() {
    this.raycaster = new Raycaster();
    this.rayOrigin = new Vector3();
    this.rayDirection = new Vector3();
  }

  /**
   * Cast ray from camera center
   */
  castFromCamera(camera: Camera, objects: Object3D[]): RaycastHit | null {
    // Set ray from camera center (0, 0)
    this.raycaster.setFromCamera(new Vector2(0, 0), camera);

    const intersects = this.raycaster.intersectObjects(objects, true);
    if (intersects.length === 0) return null;

    const hit = intersects[0];
    return {
      object: hit.object,
      distance: hit.distance,
      point: hit.point,
      normal: hit.face?.normal || new Vector3(0, 1, 0),
    };
  }

  /**
   * Cast ray from position in direction
   */
  castFromPosition(
    origin: Vector3,
    direction: Vector3,
    objects: Object3D[],
    maxDistance = 100
  ): RaycastHit | null {
    this.raycaster.set(origin, direction.normalize());
    this.raycaster.far = maxDistance;

    const intersects = this.raycaster.intersectObjects(objects, true);
    if (intersects.length === 0) return null;

    const hit = intersects[0];
    return {
      object: hit.object,
      distance: hit.distance,
      point: hit.point,
      normal: hit.face?.normal || new Vector3(0, 1, 0),
    };
  }

  /**
   * Cast ray downward from position (for ground detection)
   */
  castDownward(
    position: Vector3,
    objects: Object3D[],
    maxDistance = 100
  ): RaycastHit | null {
    const down = new Vector3(0, -1, 0);
    return this.castFromPosition(position, down, objects, maxDistance);
  }

  /**
   * Check if line of sight is clear between two positions
   */
  hasLineOfSight(
    from: Vector3,
    to: Vector3,
    obstacles: Object3D[]
  ): boolean {
    const direction = new Vector3().subVectors(to, from);
    const distance = direction.length();
    direction.normalize();

    this.raycaster.set(from, direction);
    this.raycaster.far = distance;

    const intersects = this.raycaster.intersectObjects(obstacles, true);
    return intersects.length === 0;
  }

  /**
   * Get distance to nearest object in direction
   */
  getDistanceToNearest(
    origin: Vector3,
    direction: Vector3,
    objects: Object3D[],
    maxDistance = 100
  ): number | null {
    const hit = this.castFromPosition(origin, direction, objects, maxDistance);
    return hit ? hit.distance : null;
  }
}

// Global singleton
export const raycastDetector = new RaycastDetector();
