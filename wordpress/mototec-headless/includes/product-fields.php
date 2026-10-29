<?php

if (!defined('ABSPATH')) {
    exit;
}

function mototec_product_field_keys() {
    return [
        'brand' => 'برند',
        'model' => 'مدل',
        'features' => 'ویژگی‌ها',
        'specs' => 'مشخصات فنی',
        'box_contents' => 'اقلام داخل جعبه',
        'warranty' => 'گارانتی',
        'shipping_status' => 'وضعیت ارسال',
        'note' => 'نکته',
        'faqs' => 'سوالات متداول',
    ];
}

add_action('init', 'mototec_register_product_fields');

function mototec_register_product_fields() {
    if (!class_exists('WooCommerce')) {
        return;
    }

    add_filter('woocommerce_product_data_tabs', 'mototec_product_tab');
    add_action('woocommerce_product_data_panels', 'mototec_product_panel');
    add_action('woocommerce_admin_process_product_object', 'mototec_save_product_fields');
    add_filter('woocommerce_rest_prepare_product_object', 'mototec_append_wc_rest_fields');
}

function mototec_product_tab($tabs) {
    $tabs['mototec'] = [
        'label' => 'موتوتک',
        'target' => 'mototec_product_data',
        'class' => ['show_if_simple', 'show_if_variable'],
        'priority' => 80,
    ];
    return $tabs;
}

function mototec_product_panel() {
    echo '<div id="mototec_product_data" class="panel woocommerce_options_panel hidden">';
    echo '<div class="options_group">';

    woocommerce_wp_text_input([
        'id' => '_mototec_brand',
        'label' => 'برند',
    ]);
    woocommerce_wp_text_input([
        'id' => '_mototec_model',
        'label' => 'مدل',
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_features',
        'label' => 'ویژگی‌ها',
        'description' => 'هر ویژگی در یک خط.',
        'desc_tip' => true,
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_specs',
        'label' => 'مشخصات فنی',
        'description' => 'هر مشخصه در یک خط، به شکل برچسب: مقدار',
        'desc_tip' => true,
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_box_contents',
        'label' => 'اقلام داخل جعبه',
        'description' => 'هر قلم در یک خط.',
        'desc_tip' => true,
    ]);
    woocommerce_wp_text_input([
        'id' => '_mototec_warranty',
        'label' => 'گارانتی',
    ]);
    woocommerce_wp_text_input([
        'id' => '_mototec_shipping_status',
        'label' => 'وضعیت ارسال',
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_note',
        'label' => 'نکته',
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_faqs',
        'label' => 'سوالات متداول',
        'description' => 'هر سوال در یک خط به شکل سؤال: جواب',
        'desc_tip' => true,
    ]);

    echo '</div></div>';
}

function mototec_save_product_fields($product) {
    foreach (array_keys(mototec_product_field_keys()) as $key) {
        $field = '_mototec_' . $key;
        if (!isset($_POST[$field])) {
            continue;
        }
        $product->update_meta_data($field, wc_clean(wp_unslash($_POST[$field])));
    }
}

function mototec_append_wc_rest_fields($response) {
    $data = [];
    $id = isset($response->data['id']) ? (int) $response->data['id'] : 0;
    foreach (array_keys(mototec_product_field_keys()) as $key) {
        $data[$key] = $id ? (string) get_post_meta($id, '_mototec_' . $key, true) : '';
    }
    $response->data['mototec'] = $data;
    return $response;
}
