using System.Collections;
using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Enemies
{
    /// Stationary ranged Rend: tracks the player and lobs spit on a cycle.
    [RequireComponent(typeof(Health))]
    public class RendSpitter : MonoBehaviour
    {
        [SerializeField] private float fireRange = 20f;
        [SerializeField] private float fireInterval = 2f;
        [SerializeField] private float projectileDamage = 10f;
        [SerializeField] private int sparkDrops = 2;

        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");

        private Health health;
        private Transform player;
        private float nextFireTime;
        private bool dead;
        private DamageInfo lastHit;

        public static RendSpitter Spawn(Vector3 position)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            go.name = "RendSpitter";
            go.transform.position = position + Vector3.up * 1f;
            go.transform.localScale = new Vector3(0.7f, 1f, 0.7f);

            var renderer = go.GetComponent<Renderer>();
            if (renderer != null)
                renderer.material.SetColor(BaseColorId, new Color(0.35f, 0.4f, 0.12f));

            var spitter = go.AddComponent<RendSpitter>();
            spitter.health.Configure(Faction.Rend, 25f);
            return spitter;
        }

        private void Awake()
        {
            health = GetComponent<Health>();
            health.Damaged += HandleDamaged;
            health.Died += HandleDied;
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

        private void HandleDamaged(DamageInfo info) => lastHit = info;

        private void Update()
        {
            if (dead || player == null) return;

            Vector3 toPlayer = player.position - transform.position;
            toPlayer.y = 0f;
            if (toPlayer.sqrMagnitude > 0.01f)
                transform.rotation = Quaternion.RotateTowards(
                    transform.rotation, Quaternion.LookRotation(toPlayer, Vector3.up), 240f * Time.deltaTime);

            if (toPlayer.magnitude <= fireRange && Time.time >= nextFireTime)
            {
                nextFireTime = Time.time + fireInterval;
                Vector3 eye = transform.position + Vector3.up * 0.8f;
                Vector3 aim = (player.position + Vector3.up * 1f - eye).normalized;
                EnemyProjectile.Spawn(eye, aim, transform.root, projectileDamage);
            }
        }

        private void HandleDied()
        {
            if (dead) return;
            dead = true;
            GameEvents.RaiseEnemyKilled(gameObject, lastHit);
            for (int i = 0; i < sparkDrops; i++)
                Hollowmark.Systems.SparkPickup.CreateAt(
                    transform.position + Vector3.up * 0.5f + Vector3.right * (i - 0.5f) * 0.5f, 1);
            StartCoroutine(SinkAndDespawn());
        }

        private IEnumerator SinkAndDespawn()
        {
            var collider = GetComponent<Collider>();
            if (collider != null) collider.enabled = false;
            float elapsed = 0f;
            while (elapsed < 2f)
            {
                elapsed += Time.deltaTime;
                transform.position += Vector3.down * 0.6f * Time.deltaTime;
                yield return null;
            }
            Destroy(gameObject);
        }
    }
}
