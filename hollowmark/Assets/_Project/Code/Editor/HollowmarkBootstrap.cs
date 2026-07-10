using System;
using Hollowmark.Combat;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Hollowmark.EditorTools
{
    /// One-click project setup: URP tuned for the retro look, the four
    /// Splitfang core assets, and the greybox Playground scene.
    public static class HollowmarkBootstrap
    {
        private const string PipelinePath = "Assets/Settings/HollowmarkURP.asset";
        private const string RendererPath = "Assets/Settings/HollowmarkRenderer.asset";
        private const string CoresFolder = "Assets/_Project/ScriptableObjects/Cores";

        [MenuItem("Hollowmark/Bootstrap All", false, 0)]
        public static void BootstrapAll()
        {
            ConfigureUrp();
            CreateGunCoreAssets();
            PlaygroundSceneBuilder.Build();
        }

        [MenuItem("Hollowmark/1. Configure URP (Retro)", false, 20)]
        public static void ConfigureUrp()
        {
            EnsureFolder("Assets/Settings");
            var pipeline = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelinePath);
            if (pipeline == null)
            {
                try
                {
                    var rendererData = ScriptableObject.CreateInstance<UniversalRendererData>();
                    AssetDatabase.CreateAsset(rendererData, RendererPath);
                    pipeline = UniversalRenderPipelineAsset.Create(rendererData);
                    AssetDatabase.CreateAsset(pipeline, PipelinePath);
                }
                catch (Exception exception)
                {
                    Debug.LogError(
                        "Hollowmark: automatic URP asset creation failed — create one via " +
                        "Assets > Create > Rendering > URP Asset (with Universal Renderer), assign it in " +
                        $"Project Settings > Graphics, and set Render Scale to 0.5. ({exception.Message})");
                    return;
                }
            }

            pipeline.renderScale = 0.5f; // the single biggest retro lever
            pipeline.upscalingFilter = UpscalingFilterSelection.Point;
            GraphicsSettings.defaultRenderPipeline = pipeline;
            QualitySettings.renderPipeline = pipeline;
            EditorUtility.SetDirty(pipeline);
            AssetDatabase.SaveAssets();
            Debug.Log("Hollowmark: URP configured — render scale 0.5, point upscaling.");
        }

        [MenuItem("Hollowmark/2. Create Gun Core Assets", false, 21)]
        public static void CreateGunCoresMenu() => CreateGunCoreAssets();

        public static GunCoreDefinition[] CreateGunCoreAssets()
        {
            EnsureFolder(CoresFolder);
            var cores = new[]
            {
                CreateCore("MawCore", core =>
                {
                    core.id = "maw";
                    core.displayName = "Maw";
                    core.description = "Vyre-buckshot crowd clearer. Point at problem.";
                    core.fireMode = FireMode.Single;
                    core.hitscan = true;
                    core.damage = 12f;
                    core.fireInterval = 0.7f;
                    core.pelletsPerShot = 8;
                    core.spreadDegrees = 12f;
                    core.range = 18f;
                    core.maxAmmo = 24;
                    core.knockback = 5f;
                    core.tracerColor = new Color(1f, 0.55f, 0.15f);
                }),
                CreateCore("LanceCore", core =>
                {
                    core.id = "lance";
                    core.displayName = "Lance";
                    core.description = "Precision bolt. One shot, one core.";
                    core.fireMode = FireMode.Single;
                    core.hitscan = true;
                    core.damage = 45f;
                    core.fireInterval = 0.5f;
                    core.range = 60f;
                    core.maxAmmo = 30;
                    core.knockback = 3f;
                    core.tracerColor = new Color(0.2f, 0.9f, 1f);
                }),
                CreateCore("SwarmCore", core =>
                {
                    core.id = "swarm";
                    core.displayName = "Swarm";
                    core.description = "Rapid shredder. Eats armor, drinks ammo.";
                    core.fireMode = FireMode.Auto;
                    core.hitscan = false;
                    core.damage = 6f;
                    core.fireInterval = 0.08f;
                    core.projectileSpeed = 50f;
                    core.spreadDegrees = 3f;
                    core.range = 40f;
                    core.maxAmmo = 200;
                    core.knockback = 1f;
                    core.tracerColor = new Color(0.8f, 1f, 0.3f);
                }),
                CreateCore("SunderCore", core =>
                {
                    core.id = "sunder";
                    core.displayName = "Sunder";
                    core.description = "Charge and release: arc-plasma that hunts the next target.";
                    core.fireMode = FireMode.Charge;
                    core.hitscan = false;
                    core.damage = 120f;
                    core.fireInterval = 1.2f;
                    core.projectileSpeed = 30f;
                    core.range = 50f;
                    core.maxAmmo = 6;
                    core.knockback = 8f;
                    core.chainCount = 3;
                    core.chainRadius = 8f;
                    core.maxChargeSeconds = 1.2f;
                    core.minChargeFraction = 0.3f;
                    core.tracerColor = new Color(0.7f, 0.3f, 1f);
                }),
            };
            AssetDatabase.SaveAssets();
            Debug.Log("Hollowmark: 4 gun cores ready in " + CoresFolder);
            return cores;
        }

        private static GunCoreDefinition CreateCore(string fileName, Action<GunCoreDefinition> configure)
        {
            string path = $"{CoresFolder}/{fileName}.asset";
            var existing = AssetDatabase.LoadAssetAtPath<GunCoreDefinition>(path);
            if (existing != null) return existing;

            var core = ScriptableObject.CreateInstance<GunCoreDefinition>();
            configure(core);
            AssetDatabase.CreateAsset(core, path);
            return core;
        }

        [MenuItem("Hollowmark/3. Build Playground Scene", false, 22)]
        public static void BuildSceneMenu() => PlaygroundSceneBuilder.Build();

        [MenuItem("Hollowmark/Reset Save Data", false, 40)]
        public static void ResetSaveData()
        {
            Hollowmark.Systems.SaveSystem.Delete();
            Debug.Log("Hollowmark: save data deleted.");
        }

        /// Creates nested asset folders as needed ("Assets/A/B/C").
        public static void EnsureFolder(string path)
        {
            if (string.IsNullOrEmpty(path) || AssetDatabase.IsValidFolder(path)) return;
            int slash = path.LastIndexOf('/');
            if (slash <= 0) return;
            string parent = path.Substring(0, slash);
            string name = path.Substring(slash + 1);
            EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, name);
        }
    }
}
