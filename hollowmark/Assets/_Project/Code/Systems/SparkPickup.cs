using UnityEngine;

namespace Hollowmark.Systems
{
    /// A Warden Spark: bobs, spins, magnetizes to the player, banks itself.
    /// No collider — collection is a simple distance check.
    public class SparkPickup : MonoBehaviour
    {
        [SerializeField] private int value = 1;
        [SerializeField] private float magnetRadius = 4f;
        [SerializeField] private float magnetSpeed = 10f;
        [SerializeField] private float collectRadius = 0.7f;

        private Vector3 basePosition;
        private float bobPhase;

        public static SparkPickup CreateAt(Vector3 position, int value = 1)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            go.name = "Spark";
            go.transform.position = position;
            go.transform.localScale = Vector3.one * 0.35f;

            var collider = go.GetComponent<Collider>();
            if (collider != null) Destroy(collider);

            var renderer = go.GetComponent<Renderer>();
            if (renderer != null)
            {
                var shader = Shader.Find("Universal Render Pipeline/Unlit");
                if (shader != null)
                {
                    var material = new Material(shader);
                    material.SetColor("_BaseColor", new Color(1f, 0.85f, 0.2f));
                    renderer.material = material;
                }
                else
                {
                    renderer.material.SetColor("_BaseColor", new Color(1f, 0.85f, 0.2f));
                }
            }

            var spark = go.AddComponent<SparkPickup>();
            spark.value = value;
            return spark;
        }

        private void Start()
        {
            basePosition = transform.position;
            bobPhase = (transform.position.x + transform.position.z) * 1.7f;
        }

        private void Update()
        {
            Transform player = GameManager.PlayerTransform;

            if (player != null)
            {
                Vector3 target = player.position + Vector3.up * 1f;
                float distance = Vector3.Distance(transform.position, target);

                if (distance <= collectRadius)
                {
                    SparkWallet.Add(value);
                    Destroy(gameObject);
                    return;
                }
                if (distance <= magnetRadius)
                {
                    transform.position = Vector3.MoveTowards(
                        transform.position, target, magnetSpeed * Time.deltaTime);
                    return;
                }
            }

            // Idle: bob and spin in place.
            float bob = Mathf.Sin(Time.time * 2.5f + bobPhase) * 0.15f;
            transform.position = basePosition + Vector3.up * (0.3f + bob);
            transform.Rotate(Vector3.up, 120f * Time.deltaTime, Space.World);
        }
    }
}
