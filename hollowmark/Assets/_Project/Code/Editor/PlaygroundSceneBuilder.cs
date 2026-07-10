using System.Collections.Generic;
using Hollowmark.Combat;
using Hollowmark.Enemies;
using Hollowmark.Hollow;
using Hollowmark.Player;
using Hollowmark.Skiff;
using Hollowmark.Systems;
using Hollowmark.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Hollowmark.EditorTools
{
    /// Assembles the greybox Playground: ground, platform gauntlet, arena
    /// with wave spawner, the Vat-Thing, the Skiff, sparks, checkpoints,
    /// the fully-wired player, and all managers. Primitives only.
    public static class PlaygroundSceneBuilder
    {
        private const string ScenePath = "Assets/_Project/Levels/Playground.unity";
        private const string MaterialsFolder = "Assets/Settings/Materials";

        public static void Build()
        {
            HollowmarkBootstrap.EnsureFolder("Assets/_Project/Levels");
            HollowmarkBootstrap.EnsureFolder(MaterialsFolder);
            var cores = HollowmarkBootstrap.CreateGunCoreAssets();

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var groundMat = Mat("Ground", new Color(0.55f, 0.47f, 0.35f));
            var platformMat = Mat("Platform", new Color(0.30f, 0.34f, 0.42f));
            var playerMat = Mat("PlayerBody", new Color(0.15f, 0.50f, 0.55f));
            var visorMat = Mat("Visor", new Color(0.05f, 0.05f, 0.08f));
            var skiffMat = Mat("Skiff", new Color(0.20f, 0.70f, 0.80f));
            var checkpointMat = Mat("Checkpoint", new Color(0.40f, 0.40f, 0.45f));
            var bossMat = Mat("Boss", new Color(0.30f, 0.12f, 0.35f));
            var coverMat = Mat("Cover", new Color(0.22f, 0.20f, 0.24f));
            var sparkMat = Mat("Spark", new Color(1f, 0.85f, 0.2f), unlit: true);

            BuildEnvironment(groundMat, platformMat, coverMat);
            BuildPlayerAndCamera(playerMat, visorMat, cores);
            BuildManagers();
            BuildEnemies(bossMat);
            BuildSkiff(skiffMat);
            BuildCheckpoints(checkpointMat);
            BuildSparks(sparkMat);

            EditorSceneManager.SaveScene(scene, ScenePath);
            AddToBuildSettings();
            Debug.Log("Hollowmark: Playground built. Press Play — WASD run, Space jump, " +
                      "Shift dash, F melee, LMB fire, Q/E swap cores, T Hollow form, X ride the Skiff.");
        }

        // ---------- environment ----------

        private static void BuildEnvironment(Material ground, Material platform, Material cover)
        {
            var lightGo = new GameObject("Directional Light", typeof(Light));
            var light = lightGo.GetComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.15f;
            light.color = new Color(1f, 0.95f, 0.85f);
            lightGo.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

            var groundGo = GameObject.CreatePrimitive(PrimitiveType.Plane);
            groundGo.name = "Ground";
            groundGo.transform.localScale = new Vector3(8f, 1f, 8f); // 80 x 80 m
            groundGo.GetComponent<Renderer>().sharedMaterial = ground;

            // Platform gauntlet marching up along +Z.
            var gauntlet = new (Vector3 pos, Vector3 scale)[]
            {
                (new Vector3(0f, 0.5f, 8f), new Vector3(3f, 1f, 3f)),
                (new Vector3(3f, 1.4f, 13f), new Vector3(3f, 1f, 3f)),
                (new Vector3(0f, 2.4f, 18f), new Vector3(3f, 1f, 3f)),
                (new Vector3(-3f, 3.4f, 23f), new Vector3(3f, 1f, 3f)),
                (new Vector3(0f, 4.2f, 29f), new Vector3(6f, 1f, 6f)), // summit ledge
            };
            var gauntletRoot = new GameObject("Gauntlet");
            for (int i = 0; i < gauntlet.Length; i++)
                Box($"Platform{i + 1}", gauntlet[i].pos, gauntlet[i].scale, platform, gauntletRoot.transform);

            // Arena cover.
            var arenaRoot = new GameObject("ArenaCover");
            Box("Cover1", new Vector3(17f, 0.75f, 14f), new Vector3(1.5f, 1.5f, 1.5f), cover, arenaRoot.transform);
            Box("Cover2", new Vector3(24f, 0.75f, 22f), new Vector3(1.5f, 1.5f, 1.5f), cover, arenaRoot.transform);
            Box("Cover3", new Vector3(16f, 0.75f, 25f), new Vector3(2f, 1.5f, 1f), cover, arenaRoot.transform);
        }

        // ---------- player ----------

        private static void BuildPlayerAndCamera(Material body, Material visorMat, GunCoreDefinition[] cores)
        {
            var player = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            player.name = "Rook";
            player.tag = "Player";
            player.transform.position = new Vector3(0f, 1.1f, 0f);
            Object.DestroyImmediate(player.GetComponent<CapsuleCollider>());
            player.GetComponent<Renderer>().sharedMaterial = body;

            var visor = GameObject.CreatePrimitive(PrimitiveType.Cube);
            visor.name = "Visor";
            Object.DestroyImmediate(visor.GetComponent<BoxCollider>());
            visor.transform.SetParent(player.transform, false);
            visor.transform.localPosition = new Vector3(0f, 0.5f, 0.4f);
            visor.transform.localScale = new Vector3(0.5f, 0.15f, 0.25f);
            visor.GetComponent<Renderer>().sharedMaterial = visorMat;

            var characterController = player.AddComponent<CharacterController>();
            characterController.height = 2f;
            characterController.radius = 0.5f;
            characterController.center = Vector3.zero;

            player.AddComponent<PlayerMotor>();
            player.AddComponent<PlayerController>();
            var health = player.AddComponent<Hollowmark.Core.Health>();
            SetHealth(health, Hollowmark.Core.Faction.Player, 100f);
            player.AddComponent<MeleeCombo>();
            player.AddComponent<HollowFormController>();
            player.AddComponent<HollowLash>();

            var gun = player.AddComponent<Splitfang>();
            var gunSerialized = new SerializedObject(gun);
            var coresProperty = gunSerialized.FindProperty("cores");
            coresProperty.arraySize = cores.Length;
            for (int i = 0; i < cores.Length; i++)
                coresProperty.GetArrayElementAtIndex(i).objectReferenceValue = cores[i];
            gunSerialized.ApplyModifiedPropertiesWithoutUndo();

            var cameraGo = new GameObject("Main Camera", typeof(Camera), typeof(AudioListener));
            cameraGo.tag = "MainCamera";
            cameraGo.transform.position = new Vector3(0f, 3f, -6f);
            cameraGo.AddComponent<OrbitCamera>();
        }

        // ---------- managers ----------

        private static void BuildManagers()
        {
            new GameObject("[InputReader]", typeof(Hollowmark.Core.InputReader));
            new GameObject("[GameManager]", typeof(GameManager));
            new GameObject("[HUD]", typeof(HUDController));
            new GameObject("[MissionTracker]", typeof(MissionTracker));
        }

        // ---------- enemies ----------

        private static void BuildEnemies(Material bossMat)
        {
            var spawnerGo = new GameObject("Arena Spawner");
            spawnerGo.transform.position = new Vector3(20f, 0f, 20f);
            var offsets = new[]
            {
                new Vector3(6f, 0f, 6f), new Vector3(-6f, 0f, 6f),
                new Vector3(6f, 0f, -6f), new Vector3(-6f, 0f, -6f),
            };
            for (int i = 0; i < offsets.Length; i++)
            {
                var point = new GameObject($"SpawnPoint{i + 1}");
                point.transform.SetParent(spawnerGo.transform, false);
                point.transform.localPosition = offsets[i];
            }
            spawnerGo.AddComponent<EnemySpawner>();

            var boss = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            boss.name = "The Vat-Thing";
            boss.transform.position = new Vector3(28f, 3f, -26f);
            boss.transform.localScale = new Vector3(2.5f, 3f, 2.5f);
            boss.GetComponent<Renderer>().sharedMaterial = bossMat;
            boss.AddComponent<VatThingBoss>();
            SetHealth(boss.GetComponent<Hollowmark.Core.Health>(), Hollowmark.Core.Faction.Rend, 400f);
        }

        // ---------- skiff ----------

        private static void BuildSkiff(Material skiffMat)
        {
            var skiff = new GameObject("Skiff");
            skiff.transform.position = new Vector3(-10f, 1.5f, 6f);
            var collider = skiff.AddComponent<BoxCollider>();
            collider.size = new Vector3(0.9f, 0.25f, 2.2f);

            var deck = GameObject.CreatePrimitive(PrimitiveType.Cube);
            deck.name = "Deck";
            Object.DestroyImmediate(deck.GetComponent<BoxCollider>());
            deck.transform.SetParent(skiff.transform, false);
            deck.transform.localScale = new Vector3(0.9f, 0.2f, 2.2f);
            deck.GetComponent<Renderer>().sharedMaterial = skiffMat;

            skiff.AddComponent<SkiffController>();
            skiff.AddComponent<SkiffMount>();
        }

        // ---------- pickups & checkpoints ----------

        private static void BuildCheckpoints(Material mat)
        {
            CheckpointAt(new Vector3(0f, 0f, 5f), "Checkpoint A", mat);
            CheckpointAt(new Vector3(14f, 0f, 14f), "Checkpoint B", mat);
        }

        private static void CheckpointAt(Vector3 position, string name, Material mat)
        {
            var root = new GameObject(name);
            root.transform.position = position;
            var post = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            post.name = "Post";
            post.transform.SetParent(root.transform, false);
            post.transform.localPosition = new Vector3(0f, 1.2f, 0f);
            post.transform.localScale = new Vector3(0.35f, 1.2f, 0.35f);
            post.GetComponent<Renderer>().sharedMaterial = mat;
            root.AddComponent<Checkpoint>();
        }

        private static void BuildSparks(Material sparkMat)
        {
            var positions = new[]
            {
                new Vector3(4f, 0.3f, 4f), new Vector3(8f, 0.3f, 8f), new Vector3(12f, 0.3f, 12f),
                new Vector3(0f, 1.3f, 8f), new Vector3(3f, 2.2f, 13f), new Vector3(0f, 3.2f, 18f),
                new Vector3(-3f, 4.2f, 23f),
                new Vector3(-1f, 5f, 29f), new Vector3(0f, 5f, 30f), new Vector3(1f, 5f, 29f),
                new Vector3(-10f, 0.3f, 12f), new Vector3(-14f, 0.3f, 18f),
            };
            var root = new GameObject("Sparks");
            foreach (var position in positions)
            {
                var spark = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                spark.name = "Spark";
                Object.DestroyImmediate(spark.GetComponent<SphereCollider>());
                spark.transform.SetParent(root.transform, true);
                spark.transform.position = position;
                spark.transform.localScale = Vector3.one * 0.35f;
                spark.GetComponent<Renderer>().sharedMaterial = sparkMat;
                spark.AddComponent<SparkPickup>();
            }
        }

        // ---------- helpers ----------

        private static GameObject Box(string name, Vector3 position, Vector3 scale, Material mat, Transform parent = null)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = scale;
            if (parent != null) go.transform.SetParent(parent, true);
            var renderer = go.GetComponent<Renderer>();
            if (renderer != null && mat != null) renderer.sharedMaterial = mat;
            return go;
        }

        private static Material Mat(string name, Color color, bool unlit = false)
        {
            string path = $"{MaterialsFolder}/{name}.mat";
            var existing = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (existing != null) return existing;

            var shader = Shader.Find(unlit
                ? "Universal Render Pipeline/Unlit"
                : "Universal Render Pipeline/Lit");
            if (shader == null) shader = Shader.Find("Standard");
            var material = new Material(shader) { color = color };
            AssetDatabase.CreateAsset(material, path);
            return material;
        }

        private static void SetHealth(Hollowmark.Core.Health health, Hollowmark.Core.Faction faction, float max)
        {
            var serialized = new SerializedObject(health);
            serialized.FindProperty("maxHealth").floatValue = max;
            serialized.FindProperty("faction").enumValueIndex = (int)faction;
            serialized.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void AddToBuildSettings()
        {
            var scenes = new List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
            if (!scenes.Exists(existing => existing.path == ScenePath))
            {
                scenes.Add(new EditorBuildSettingsScene(ScenePath, true));
                EditorBuildSettings.scenes = scenes.ToArray();
            }
        }
    }
}
