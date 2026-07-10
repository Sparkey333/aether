using System.Collections;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Enemies
{
    /// The breakout boss: a hulking failed experiment. Two attacks
    /// (leaping slam, straight charge), a second phase under 50% health
    /// that speeds up and calls adds. Fought on flat arena ground.
    [RequireComponent(typeof(Health))]
    public class VatThingBoss : MonoBehaviour
    {
        [Header("Identity")]
        [SerializeField] private string bossName = "THE VAT-THING";

        [Header("Activation")]
        [SerializeField] private float activationRange = 18f;

        [Header("Slam")]
        [SerializeField] private float slamDamage = 25f;
        [SerializeField] private float slamRadius = 4.5f;
        [SerializeField] private float slamLeapSeconds = 0.7f;

        [Header("Charge")]
        [SerializeField] private float chargeDamage = 20f;
        [SerializeField] private float chargeSpeed = 14f;
        [SerializeField] private float chargeSeconds = 0.9f;

        [Header("Pacing")]
        [SerializeField] private float attackCooldown = 2f;
        [SerializeField] private float phase2Cooldown = 1.2f;
        [SerializeField] private int sparkDrops = 10;

        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");

        private Health health;
        private Transform player;
        private bool activated;
        private bool dead;
        private bool addsCalled;
        private float groundY;
        private DamageInfo lastHit;

        private void Awake()
        {
            health = GetComponent<Health>();
            health.Changed += HandleHealthChanged;
            health.Damaged += HandleDamaged;
            health.Died += HandleDied;
            groundY = transform.position.y;
        }

        private void OnEnable()
        {
            GameEvents.PlayerSpawned += HandlePlayerSpawned;
        }

        private void OnDisable()
        {
            GameEvents.PlayerSpawned -= HandlePlayerSpawned;
        }

        private void OnDestroy()
        {
            if (health != null)
            {
                health.Changed -= HandleHealthChanged;
                health.Damaged -= HandleDamaged;
                health.Died -= HandleDied;
            }
        }

        private void Start()
        {
            if (player == null)
            {
                var found = FindFirstObjectByType<Hollowmark.Player.PlayerController>();
                if (found != null) player = found.transform;
            }
        }

        private void HandlePlayerSpawned(GameObject playerGo)
        {
            if (playerGo != null) player = playerGo.transform;
        }

        private void HandleDamaged(DamageInfo info)
        {
            lastHit = info;
            if (!activated) Activate(); // getting shot counts as an introduction
        }

        private void HandleHealthChanged(float current, float max)
        {
            if (activated && !dead)
                GameEvents.RaiseBossHealthChanged(bossName, max > 0f ? current / max : 0f);
        }

        private void Update()
        {
            if (activated || dead || player == null) return;
            if (Vector3.Distance(transform.position, player.position) <= activationRange)
                Activate();
        }

        private void Activate()
        {
            if (activated || dead) return;
            activated = true;
            GameEvents.RaiseAnnounce(bossName);
            GameEvents.RaiseBossHealthChanged(bossName, health.Normalized);
            StartCoroutine(BehaviorLoop());
        }

        private bool InPhase2 => health != null && health.Normalized < 0.5f;

        private IEnumerator BehaviorLoop()
        {
            int beat = 0;
            while (!dead)
            {
                if (player == null)
                {
                    yield return new WaitForSeconds(0.5f);
                    continue;
                }

                if (InPhase2 && !addsCalled)
                {
                    addsCalled = true;
                    GameEvents.RaiseAnnounce("IT CALLS FOR HELP");
                    RendGrunt.Spawn(transform.position + transform.right * 4f);
                    RendGrunt.Spawn(transform.position - transform.right * 4f);
                }

                if (beat % 2 == 0)
                    yield return Slam();
                else
                    yield return Charge();
                beat++;

                yield return new WaitForSeconds(InPhase2 ? phase2Cooldown : attackCooldown);
            }
        }

        private IEnumerator Slam()
        {
            Vector3 start = transform.position;
            Vector3 target = player != null ? player.position : start;
            target.y = groundY;

            float elapsed = 0f;
            while (elapsed < slamLeapSeconds && !dead)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / slamLeapSeconds);
                Vector3 position = Vector3.Lerp(start, target, t);
                position.y = groundY + Mathf.Sin(t * Mathf.PI) * 4f;
                transform.position = position;
                yield return null;
            }
            if (dead) yield break;

            transform.position = new Vector3(target.x, groundY, target.z);
            DamageAround(transform.position, slamRadius, slamDamage, 10f);
            StartCoroutine(RingVisual(transform.position));
        }

        private IEnumerator Charge()
        {
            if (player == null) yield break;
            Vector3 direction = player.position - transform.position;
            direction.y = 0f;
            direction.Normalize();
            FaceDirection(direction);

            float elapsed = 0f;
            float nextTouchDamage = 0f;
            while (elapsed < chargeSeconds && !dead)
            {
                elapsed += Time.deltaTime;
                transform.position += direction * chargeSpeed * Time.deltaTime;

                if (Time.time >= nextTouchDamage && player != null &&
                    Vector3.Distance(transform.position, player.position) < 2.5f)
                {
                    nextTouchDamage = Time.time + 0.5f;
                    DamageAround(transform.position, 2.6f, chargeDamage, 12f);
                }
                yield return null;
            }
        }

        private void FaceDirection(Vector3 direction)
        {
            if (direction.sqrMagnitude > 0.001f)
                transform.rotation = Quaternion.LookRotation(direction, Vector3.up);
        }

        private void DamageAround(Vector3 center, float radius, float damage, float knockback)
        {
            var colliders = Physics.OverlapSphere(center, radius,
                Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);
            foreach (var collider in colliders)
            {
                var damageable = collider.GetComponentInParent<IDamageable>();
                if (damageable == null || damageable.IsDead || damageable.Faction != Faction.Player) continue;

                Vector3 away = collider.bounds.center - center;
                away.y = 0f;
                away = away.sqrMagnitude > 0.001f ? away.normalized : Vector3.forward;
                var info = new DamageInfo(damage, gameObject, Faction.Rend)
                {
                    Point = collider.bounds.center,
                    Normal = -away,
                    Knockback = away * knockback + Vector3.up * 3f,
                };
                damageable.TakeDamage(info);
                break; // only the player faction takes it; one target is enough
            }
        }

        private IEnumerator RingVisual(Vector3 center)
        {
            var ring = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            ring.name = "SlamRing";
            var collider = ring.GetComponent<Collider>();
            if (collider != null) Destroy(collider);
            var renderer = ring.GetComponent<Renderer>();
            if (renderer != null)
                renderer.material.SetColor(BaseColorId, new Color(1f, 0.5f, 0.1f));

            ring.transform.position = center + Vector3.up * 0.05f;
            float elapsed = 0f;
            while (elapsed < 0.3f && ring != null)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / 0.3f;
                ring.transform.localScale = new Vector3(
                    Mathf.Lerp(1f, slamRadius * 2f, t), 0.05f, Mathf.Lerp(1f, slamRadius * 2f, t));
                yield return null;
            }
            if (ring != null) Destroy(ring);
        }

        private void HandleDied()
        {
            if (dead) return;
            dead = true;
            GameEvents.RaiseBossHealthChanged(bossName, 0f);
            GameEvents.RaiseEnemyKilled(gameObject, lastHit);
            GameEvents.RaiseAnnounce("THE VAT-THING FALLS");

            for (int i = 0; i < sparkDrops; i++)
            {
                float angle = i * 36f * Mathf.Deg2Rad;
                Hollowmark.Systems.SparkPickup.CreateAt(
                    transform.position + new Vector3(Mathf.Cos(angle), 0.5f, Mathf.Sin(angle)) * 2f, 1);
            }

            var ownCollider = GetComponent<Collider>();
            if (ownCollider != null) ownCollider.enabled = false;
            StartCoroutine(SinkAndDespawn());
        }

        private IEnumerator SinkAndDespawn()
        {
            float elapsed = 0f;
            while (elapsed < 3f)
            {
                elapsed += Time.deltaTime;
                transform.position += Vector3.down * 1f * Time.deltaTime;
                yield return null;
            }
            Destroy(gameObject);
        }
    }
}
