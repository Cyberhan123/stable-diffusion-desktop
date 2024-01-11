use std::ffi::CString;
use std::os::raw::{c_int, c_float};
use std::slice;
use base64::{alphabet, Engine, engine};
use base64::engine::general_purpose;
use image::{DynamicImage, RgbImage};

pub mod csd {
    use std::os::raw::{c_char, c_float, c_int, c_uint, c_void};

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub struct sd_ctx_t;

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub struct upscaler_ctx_t;

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub enum rng_type_t {
        STD_DEFAULT_RNG,
        CUDA_RNG,
    }

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub enum sample_method_t {
        EULER_A,
        EULER,
        HEUN,
        DPM2,
        DPMPP2S_A,
        DPMPP2M,
        DPMPP2Mv2,
        LCM,
        N_SAMPLE_METHODS,
    }

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub enum schedule_t {
        DEFAULT,
        DISCRETE,
        KARRAS,
        N_SCHEDULES,
    }

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub enum sd_type_t {
        SD_TYPE_F32 = 0,
        SD_TYPE_F16 = 1,
        SD_TYPE_Q4_0 = 2,
        SD_TYPE_Q4_1 = 3,
        SD_TYPE_Q5_0 = 6,
        SD_TYPE_Q5_1 = 7,
        SD_TYPE_Q8_0 = 8,
        SD_TYPE_Q8_1 = 9,
        SD_TYPE_Q2_K = 10,
        SD_TYPE_Q3_K = 11,
        SD_TYPE_Q4_K = 12,
        SD_TYPE_Q5_K = 13,
        SD_TYPE_Q6_K = 14,
        SD_TYPE_Q8_K = 15,
        SD_TYPE_I8,
        SD_TYPE_I16,
        SD_TYPE_I32,
        SD_TYPE_COUNT,
    }

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub enum sd_log_level_t {
        SD_LOG_DEBUG,
        SD_LOG_INFO,
        SD_LOG_WARN,
        SD_LOG_ERROR,
    }

    #[repr(C)]
    #[allow(non_camel_case_types)]
    pub struct sd_image_t {
        pub width: c_uint,
        pub height: c_uint,
        pub channel: c_uint,
        pub data: *mut u8,
    }

    #[link(name = "stable-diffusion")]
    extern "C" {
        pub fn sd_type_name(type_: sd_type_t) -> *const c_char;
        pub fn sd_set_log_callback(sd_log_cb: extern "C" fn(sd_log_level_t, *const c_char, *mut c_void), data: *mut c_void);
        pub fn get_num_physical_cores() -> c_int;
        pub fn sd_get_system_info() -> *const c_char;
        pub fn new_sd_ctx(
            model_path: *const c_char,
            vae_path: *const c_char,
            taesd_path: *const c_char,
            lora_model_dir: *const c_char,
            vae_decode_only: bool,
            vae_tiling: bool,
            free_params_immediately: bool,
            n_threads: c_int,
            wtype: sd_type_t,
            rng_type: rng_type_t,
            s: schedule_t,
        ) -> *mut sd_ctx_t;
        pub fn free_sd_ctx(sd_ctx: *mut sd_ctx_t);
        pub fn txt2img(
            sd_ctx: *mut sd_ctx_t,
            prompt: *const c_char,
            negative_prompt: *const c_char,
            clip_skip: c_int,
            cfg_scale: c_float,
            width: c_int,
            height: c_int,
            sample_method: sample_method_t,
            sample_steps: c_int,
            seed: i64,
            batch_count: c_int,
        ) -> *mut sd_image_t;
        pub fn img2img(
            sd_ctx: *mut sd_ctx_t,
            init_image: sd_image_t,
            prompt: *const c_char,
            negative_prompt: *const c_char,
            clip_skip: c_int,
            cfg_scale: c_float,
            width: c_int,
            height: c_int,
            sample_method: sample_method_t,
            sample_steps: c_int,
            strength: c_float,
            seed: i64,
            batch_count: c_int,
        ) -> *mut sd_image_t;
        pub fn new_upscaler_ctx(esrgan_path: *const c_char, n_threads: c_int, wtype: sd_type_t) -> *mut upscaler_ctx_t;
        pub fn free_upscaler_ctx(upscaler_ctx: *mut upscaler_ctx_t);
        pub fn upscale(upscaler_ctx: *mut upscaler_ctx_t, input_image: sd_image_t, upscale_factor: c_uint) -> *mut sd_image_t;
    }
}


pub struct StableDiffusion {
    ctx: *mut csd::sd_ctx_t,
}

impl StableDiffusion {
    pub fn new(
        model_path: &str,
        vae_path: &str,
        taesd_path: &str,
        lora_model_dir: &str,
        vae_decode_only: bool,
        vae_tiling: bool,
        free_params_immediately: bool,
        n_threads: c_int,
        wtype: csd::sd_type_t,
        rng_type: csd::rng_type_t,
        s: csd::schedule_t,
    ) -> Result<Self, String> {
        let model_path_c = CString::new(model_path).expect("CString::new failed");
        let vae_path_c = CString::new(vae_path).expect("CString::new failed");
        let taesd_path_c = CString::new(taesd_path).expect("CString::new failed");
        let lora_model_dir_c = CString::new(lora_model_dir).expect("CString::new failed");

        let ctx = unsafe {
            csd::new_sd_ctx(
                model_path_c.as_ptr(),
                vae_path_c.as_ptr(),
                taesd_path_c.as_ptr(),
                lora_model_dir_c.as_ptr(),
                vae_decode_only,
                vae_tiling,
                free_params_immediately,
                n_threads,
                wtype,
                rng_type,
                s,
            )
        };

        if ctx.is_null() {
            Err("Failed to create sd_ctx_t".to_string())
        } else {
            Ok(StableDiffusion { ctx })
        }
    }

    pub fn txt2img(
        &self,
        prompt: &str,
        negative_prompt: &str,
        clip_skip: c_int,
        cfg_scale: c_float,
        width: c_int,
        height: c_int,
        sample_method: csd::sample_method_t,
        sample_steps: c_int,
        seed: i64,
        batch_count: c_int,
    ) -> Option<Vec<String>> {
        let prompt_c = CString::new(prompt).expect("CString::new failed");
        let negative_prompt_c = CString::new(negative_prompt).expect("CString::new failed");

        let result = unsafe {
            csd::txt2img(
                self.ctx,
                prompt_c.as_ptr(),
                negative_prompt_c.as_ptr(),
                clip_skip,
                cfg_scale,
                width,
                height,
                sample_method,
                sample_steps,
                seed,
                batch_count,
            )
        };

        if result.is_null() {
            None
        } else {
            Some(SdImage::new(result, batch_count as usize).to_base64_png_all())
        }
    }
}

impl Drop for StableDiffusion {
    fn drop(&mut self) {
        unsafe {
            csd::free_sd_ctx(self.ctx);
        }
    }
}

pub struct SdImage {
    inner: *mut csd::sd_image_t,
    sd_image_slice: * [csd::sd_image_t],
}

impl SdImage {
    pub fn new(inner: *mut csd::sd_image_t, size: usize) -> Self {
        SdImage {
            inner,
            sd_image_slice: unsafe {
                std::slice::from_raw_parts(inner, size)
            },
        }
    }
    pub fn to_base64_png_all(&self) -> Vec<String> {
        self.sd_image_slice
            .iter()
            .map(|sd_image| {
                unsafe {
                    let width = (*sd_image).width;
                    let height = (*sd_image).height;
                    let channel = (*sd_image).channel;

                    let data = slice::from_raw_parts((*sd_image).data, (width * height * channel) as usize);

                    let rgb_image = RgbImage::from_raw(width, height, data.to_vec()).unwrap();

                    let dynamic_image = DynamicImage::ImageRgb8(rgb_image);

                    let mut buffer = Vec::new();
                    dynamic_image
                        .write_to(&mut buffer, image::ImageOutputFormat::Png)
                        .expect("Failed to encode image as PNG");
                    const URL_ENG: engine::GeneralPurpose =
                        engine::GeneralPurpose::new(&alphabet::URL_SAFE, general_purpose::NO_PAD);
                    URL_ENG.encode(buffer)
                }
            })
            .collect()
    }
}



