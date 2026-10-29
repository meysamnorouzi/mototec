<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', 'mototec_register_routes');

function mototec_register_routes() {
    $routes = [
        '/products' => 'mototec_rest_products',
        '/product-categories' => 'mototec_rest_product_categories',
        '/posts' => 'mototec_rest_posts',
        '/post-categories' => 'mototec_rest_post_categories',
    ];

    foreach ($routes as $path => $callback) {
        register_rest_route('mototec/v1', $path, [
            'methods' => 'GET',
            'callback' => $callback,
            'permission_callback' => 'mototec_rest_permission',
        ]);
    }
}

function mototec_rest_permission(WP_REST_Request $request) {
    $key = (string) get_option('mototec_api_key', '');
    $sent = (string) $request->get_header('x-mototec-key');
    if ($key !== '' && $sent !== '' && hash_equals($key, $sent)) {
        return true;
    }
    return new WP_Error('mototec_forbidden', 'کلید API نادرست است.', ['status' => 401]);
}

function mototec_request_page(WP_REST_Request $request) {
    $page = max(1, (int) $request->get_param('page'));
    $per_page = (int) $request->get_param('per_page');
    if ($per_page < 1) {
        $per_page = 100;
    }
    if ($per_page > 100) {
        $per_page = 100;
    }
    return [$page, $per_page];
}

function mototec_paged_response($items, $total, $per_page) {
    $response = rest_ensure_response($items);
    $pages = (int) ceil($total / max(1, $per_page));
    $response->header('X-WP-Total', (string) $total);
    $response->header('X-WP-TotalPages', (string) max(1, $pages));
    return $response;
}

function mototec_rest_products(WP_REST_Request $request) {
    if (!function_exists('wc_get_products')) {
        return new WP_Error('mototec_woocommerce', 'ووکامرس فعال نیست.', ['status' => 503]);
    }

    list($page, $per_page) = mototec_request_page($request);
    $result = wc_get_products([
        'status' => 'publish',
        'limit' => $per_page,
        'page' => $page,
        'paginate' => true,
        'orderby' => 'modified',
        'order' => 'DESC',
    ]);

    $items = [];
    foreach ($result->products as $product) {
        $items[] = mototec_map_product($product);
    }

    return mototec_paged_response($items, (int) $result->total, $per_page);
}

function mototec_rest_product_categories() {
    if (!taxonomy_exists('product_cat')) {
        return new WP_Error('mototec_woocommerce', 'ووکامرس فعال نیست.', ['status' => 503]);
    }
    return rest_ensure_response(mototec_terms('product_cat'));
}

function mototec_rest_posts(WP_REST_Request $request) {
    list($page, $per_page) = mototec_request_page($request);
    $query = new WP_Query([
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'orderby' => 'date',
        'order' => 'DESC',
        'ignore_sticky_posts' => true,
    ]);

    $items = [];
    foreach ($query->posts as $post) {
        setup_postdata($post);
        $items[] = mototec_map_post($post);
    }

    $response = mototec_paged_response($items, (int) $query->found_posts, $per_page);
    wp_reset_postdata();
    return $response;
}

function mototec_rest_post_categories() {
    return rest_ensure_response(mototec_terms('category'));
}

function mototec_terms($taxonomy) {
    $terms = get_terms([
        'taxonomy' => $taxonomy,
        'hide_empty' => false,
    ]);
    if (is_wp_error($terms)) {
        return [];
    }

    $items = [];
    foreach ($terms as $term) {
        if ($term->slug === 'uncategorized') {
            continue;
        }
        $items[] = [
            'id' => (int) $term->term_id,
            'slug' => $term->slug,
            'name' => html_entity_decode($term->name, ENT_QUOTES, 'UTF-8'),
            'description' => trim(wp_strip_all_tags(term_description((int) $term->term_id, $taxonomy))),
            'parent' => (int) $term->parent,
            'count' => (int) $term->count,
        ];
    }
    return $items;
}

function mototec_map_product($product) {
    $brand = mototec_text(mototec_meta($product, 'brand'));
    if ($brand === '') {
        $brand = mototec_attribute_value($product, ['برند', 'brand']);
    }
    $model = mototec_text(mototec_meta($product, 'model'));
    if ($model === '') {
        $model = mototec_attribute_value($product, ['مدل', 'model']);
    }

    $specs = mototec_specs(mototec_meta($product, 'specs'));
    if (!$specs) {
        $specs = mototec_specs_from_attributes($product);
    }

    $price = mototec_money($product->get_price());
    $regular = mototec_money($product->get_regular_price());
    $modified = $product->get_date_modified();
    $quantity = $product->get_stock_quantity();

    return [
        'id' => (int) $product->get_id(),
        'slug' => $product->get_slug(),
        'name' => html_entity_decode($product->get_name(), ENT_QUOTES, 'UTF-8'),
        'brand' => $brand,
        'model' => $model,
        'sku' => (string) $product->get_sku(),
        'price' => $price,
        'regular_price' => $regular,
        'stock_status' => (string) $product->get_stock_status(),
        'stock_quantity' => is_numeric($quantity) ? (int) $quantity : null,
        'description' => (string) $product->get_description(),
        'short_description' => (string) $product->get_short_description(),
        'categories' => mototec_product_categories($product),
        'images' => mototec_product_images($product),
        'specs' => $specs,
        'features' => mototec_lines(mototec_meta($product, 'features')),
        'box_contents' => mototec_lines(mototec_meta($product, 'box_contents')),
        'warranty' => mototec_text(mototec_meta($product, 'warranty')),
        'shipping_status' => mototec_text(mototec_meta($product, 'shipping_status')),
        'note' => mototec_text(mototec_meta($product, 'note')),
        'faqs' => mototec_faqs(mototec_meta($product, 'faqs')),
        'featured' => (bool) $product->is_featured(),
        'modified' => $modified ? $modified->date('c') : '',
    ];
}

function mototec_map_post($post) {
    $thumb = (int) get_post_thumbnail_id($post);
    $image = null;
    if ($thumb) {
        $src = wp_get_attachment_image_url($thumb, 'large');
        if ($src) {
            $alt = (string) get_post_meta($thumb, '_wp_attachment_image_alt', true);
            $image = [
                'src' => $src,
                'alt' => $alt !== '' ? $alt : get_the_title($post),
            ];
        }
    }

    $categories = [];
    $terms = get_the_terms($post, 'category');
    if (is_array($terms)) {
        foreach ($terms as $term) {
            if ($term->slug === 'uncategorized') {
                continue;
            }
            $categories[] = [
                'id' => (int) $term->term_id,
                'slug' => $term->slug,
                'name' => html_entity_decode($term->name, ENT_QUOTES, 'UTF-8'),
            ];
        }
    }

    $excerpt = has_excerpt($post) ? $post->post_excerpt : wp_trim_words(wp_strip_all_tags($post->post_content), 40, '…');
    $published = get_post_datetime($post, 'date', 'gmt');
    $modified = get_post_datetime($post, 'modified', 'gmt');

    return [
        'id' => (int) $post->ID,
        'slug' => $post->post_name,
        'title' => get_the_title($post),
        'excerpt' => trim(wp_strip_all_tags($excerpt)),
        'content' => apply_filters('the_content', $post->post_content),
        'date' => $published ? $published->format('c') : '',
        'modified' => $modified ? $modified->format('c') : '',
        'image' => $image,
        'categories' => $categories,
        'author' => get_the_author_meta('display_name', (int) $post->post_author),
    ];
}

function mototec_product_categories($product) {
    $items = [];
    $terms = get_the_terms($product->get_id(), 'product_cat');
    if (!is_array($terms)) {
        return $items;
    }
    foreach ($terms as $term) {
        if ($term->slug === 'uncategorized') {
            continue;
        }
        $items[] = [
            'id' => (int) $term->term_id,
            'slug' => $term->slug,
            'name' => html_entity_decode($term->name, ENT_QUOTES, 'UTF-8'),
        ];
    }
    return $items;
}

function mototec_product_images($product) {
    $ids = [];
    $featured = (int) $product->get_image_id();
    if ($featured) {
        $ids[] = $featured;
    }
    foreach ($product->get_gallery_image_ids() as $id) {
        $id = (int) $id;
        if ($id && !in_array($id, $ids, true)) {
            $ids[] = $id;
        }
    }

    $images = [];
    foreach ($ids as $id) {
        $src = wp_get_attachment_image_url($id, 'large');
        if (!$src) {
            continue;
        }
        $alt = (string) get_post_meta($id, '_wp_attachment_image_alt', true);
        $images[] = [
            'src' => $src,
            'alt' => $alt !== '' ? $alt : $product->get_name(),
        ];
    }
    return $images;
}

function mototec_meta($product, $key) {
    return $product->get_meta('_mototec_' . $key, true);
}

function mototec_text($value) {
    if (is_array($value)) {
        return '';
    }
    return trim(html_entity_decode(wp_strip_all_tags((string) $value), ENT_QUOTES, 'UTF-8'));
}

function mototec_lines($value) {
    if (is_array($value)) {
        $lines = [];
        foreach ($value as $item) {
            $text = mototec_text($item);
            if ($text !== '') {
                $lines[] = $text;
            }
        }
        return $lines;
    }

    $raw = trim((string) $value);
    if ($raw === '') {
        return [];
    }
    if (isset($raw[0]) && $raw[0] === '[') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return mototec_lines($decoded);
        }
    }

    $lines = [];
    foreach (preg_split('/\r\n|\r|\n/', $raw) as $line) {
        $line = trim(preg_replace('/^[-•*]\s*/u', '', $line));
        if ($line !== '') {
            $lines[] = html_entity_decode($line, ENT_QUOTES, 'UTF-8');
        }
    }
    return $lines;
}

function mototec_faqs($value) {
    if (is_array($value)) {
        $faqs = [];
        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }
            $question = mototec_text(isset($item['question']) ? $item['question'] : (isset($item['label']) ? $item['label'] : ''));
            $answer = mototec_text(isset($item['answer']) ? $item['answer'] : (isset($item['value']) ? $item['value'] : ''));
            if ($question !== '' && $answer !== '') {
                $faqs[] = ['question' => $question, 'answer' => $answer];
            }
        }
        return $faqs;
    }

    $raw = trim((string) $value);
    if ($raw !== '' && isset($raw[0]) && $raw[0] === '[') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return mototec_faqs($decoded);
        }
    }

    $faqs = [];
    foreach (mototec_lines($raw) as $line) {
        $parts = preg_split('/[:：]/u', $line, 2);
        if (!is_array($parts) || count($parts) < 2) {
            continue;
        }
        $question = trim($parts[0]);
        $answer = trim($parts[1]);
        if ($question !== '' && $answer !== '') {
            $faqs[] = ['question' => $question, 'answer' => $answer];
        }
    }
    return $faqs;
}

function mototec_specs($value) {
    if (is_array($value)) {
        $specs = [];
        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }
            $label = mototec_text(isset($item['label']) ? $item['label'] : (isset($item['name']) ? $item['name'] : ''));
            $spec = mototec_text(isset($item['value']) ? $item['value'] : '');
            if ($label !== '' && $spec !== '') {
                $specs[] = ['label' => $label, 'value' => $spec];
            }
        }
        return $specs;
    }

    $raw = trim((string) $value);
    if ($raw !== '' && isset($raw[0]) && $raw[0] === '[') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return mototec_specs($decoded);
        }
    }

    $specs = [];
    foreach (mototec_lines($raw) as $line) {
        $parts = preg_split('/[:：]/u', $line, 2);
        if (!is_array($parts) || count($parts) < 2) {
            continue;
        }
        $label = trim($parts[0]);
        $spec = trim($parts[1]);
        if ($label !== '' && $spec !== '') {
            $specs[] = ['label' => $label, 'value' => $spec];
        }
    }
    return $specs;
}

function mototec_specs_from_attributes($product) {
    $specs = [];
    foreach ($product->get_attributes() as $attribute) {
        if (is_callable([$attribute, 'get_visible']) && !$attribute->get_visible()) {
            continue;
        }
        $label = wc_attribute_label($attribute->get_name());
        if (preg_match('/^(برند|مدل|brand|model)$/iu', $label)) {
            continue;
        }
        $options = mototec_attribute_options($attribute);
        if ($label && $options) {
            $specs[] = ['label' => $label, 'value' => implode('، ', $options)];
        }
    }
    return $specs;
}

function mototec_attribute_value($product, $names) {
    $wanted = array_map('strtolower', $names);
    foreach ($product->get_attributes() as $attribute) {
        $label = strtolower(wc_attribute_label($attribute->get_name()));
        if (!in_array($label, $wanted, true)) {
            continue;
        }
        $options = mototec_attribute_options($attribute);
        return $options ? $options[0] : '';
    }
    return '';
}

function mototec_attribute_options($attribute) {
    $options = $attribute->get_options();
    if ($attribute->is_taxonomy()) {
        $named = [];
        foreach ($options as $id) {
            $term = get_term((int) $id);
            if ($term && !is_wp_error($term)) {
                $named[] = $term->name;
            }
        }
        $options = $named;
    }
    $clean = [];
    foreach ($options as $option) {
        $text = mototec_text($option);
        if ($text !== '') {
            $clean[] = $text;
        }
    }
    return $clean;
}

function mototec_money($value) {
    if ($value === '' || $value === null) {
        return null;
    }
    $amount = (float) $value;
    if ($amount <= 0) {
        return null;
    }
    return $amount;
}
