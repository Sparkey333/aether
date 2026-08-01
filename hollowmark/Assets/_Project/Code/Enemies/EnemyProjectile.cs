using Hollowmark.Core;
using UnityEngine;

namespace Hollowmark.Enemies
{
    /// Slow, dodgeable Rend spit. Damages the player faction only;
    /// dies on any surface it touches.
    public class EnemyProjectile : MonoBehaviour
    {
        private Vector3 direction;
        private float speed;
        private float damage;
        private Transform ownerRoot;
        private float dieAt;

        public static EnemyProjectile Spawn(Vector3 origin, Vector3 direction, Transform ownerRoot,
            float damage = 10f, float speed = 14f)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            go.name = "RendSpit";
            go.transform.localScale = Vector3.one * 0.25f;
            go.transform.position = origin;

            var collider = go.GetComponent<Collider>();
            if (collider != null) Destroy(collider);

            var renderer = go.GetComponent<Renderer>();
            if (renderer != null)
                renderer.material.SetColor("_BaseColor", new Color(0.7f, 1f, 0.2f));

            var projectile = go.AddComponent<EnemyProjectile>();
            projectile.direction = direction.normalized;
            projectile.speed = speed;
            projectile.damage = damage;
            projectile.ownerRoot = ownerRoot;
            projectile.dieAt = Time.time + 5f;
            return projectile;
        }

        private void Update()
        {
            if (Time.time > dieAt)
            {
                Destroy(gameObject);
                return;
            }

            float step = speed * Time.deltaTime;
            var hits = Physics.SphereCastAll(transform.position, 0.12f, direction, step + 0.05f,
                Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore);

            RaycastHit best = default;
            bool found = false;
            float bestDistance = float.MaxValue;
            foreach (var hit in hits)
            {
                Transform root = hit.collider.transform.root;
                if (root == transform.root) continue; // own collider until Destroy lands
                if (ownerRoot != null && root == ownerRoot) continue;
                if (hit.distance < bestDistance)
                {
                    bestDistance = hit.distance;
                    best = hit;
                    found = true;
                }
            }

            if (found)
            {
                var damageable = best.collider.GetComponentInParent<IDamageable>();
                if (damageable != null && !damageable.IsDead && damageable.Faction == Faction.Player)
                {
                    var info = new DamageInfo(damage, gameObject, Faction.Rend)
                    {
                        Point = best.point,
                        Normal = best.normal,
                        Knockback = direction * 3f,
                    };
                    damageable.TakeDamage(info);
                }
                Destroy(gameObject);
                return;
            }

            transform.position += direction * step;
        }
    }
}
