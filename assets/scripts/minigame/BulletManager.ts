import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { Bullet } from './Bullet';
import { BulletPool } from './BulletPool';
import { EventManager } from './EventManager';
import { GameSceneManager } from './GameSceneManager';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
  private static _instance: BulletManager = null;
  public static get instance(): BulletManager {
    return BulletManager._instance;
  }
  @property(Node)
  public gunBody: Node = null;
  @property(Prefab)
  public bulletPrefab: Prefab = null;

  // 子彈池
  public bullet_pool: BulletPool = null;

  protected onLoad(): void {
    if (!BulletManager._instance) {
      BulletManager._instance = this;
    } else {
      this.destroy();
    }
    // 註冊事件
    EventManager.eventTarget.on('stop-bullet', this.stopBullet, this); // Bullet.ts 發布
  }

  protected start(): void {
    this.bullet_pool = new BulletPool(this.bulletPrefab);
  }

  protected onDestroy(): void {
    if (BulletManager._instance === this) {
      BulletManager._instance = null;
    }
    // 註銷事件
    EventManager.eventTarget.off('stop-bullet', this.stopBullet, this);
  }

  spawnBullet() {
    const bullet = this.bullet_pool.getBullet();
    const bulletComponent = bullet.getComponent(Bullet);
    
    // Set bullet direction
    bulletComponent.initDirection(this.gunBody.angle);
    
    // ✅ GET BULLET LEVEL FROM GAMESCENEMANAGER
    const currentBulletLevel = this.getCurrentBulletLevel();
    bulletComponent.setBulletDamage(currentBulletLevel);
    
    bullet.setPosition(0, 0, 0);
    bullet.setParent(this.node);
  }

  // ✅ ADD MISSING stopBullet METHOD
  stopBullet(bullet: Node) {
    // 回收子彈
    if (this.bullet_pool) {
      this.bullet_pool.markAsInactive(bullet);
    } else {
      bullet.destroy();
    }
  }

  // ✅ GET CURRENT BULLET LEVEL FROM GAMESCENEMANAGER
  getCurrentBulletLevel(): number {
    const gameSceneManager = this.node.scene.getComponentInChildren(GameSceneManager);
    if (gameSceneManager) {
      return gameSceneManager.bulletLevel;
    }
    return 3; // Default level if not found
  }
}
